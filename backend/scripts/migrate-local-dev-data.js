const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/user');
const Arena = require('../models/arena');
const Booking = require('../models/booking');
const valleyArenas = require('../data/valleyArenas');

const localStorePath = path.join(__dirname, '..', 'data', 'local-dev-db.json');

const readLocalStore = () => {
  if (!fs.existsSync(localStorePath)) {
    return { users: [], bookings: [], arenas: [] };
  }

  return JSON.parse(fs.readFileSync(localStorePath, 'utf8'));
};

const getLocalArenaId = (_, index) => `local-arena-${index + 1}`;

async function ensureArenaSeed() {
  const existingArenas = await Arena.find({}).select('_id name');
  if (existingArenas.length > 0) {
    const arenaByLocalId = new Map();
    existingArenas.forEach((arena) => {
      const sourceIndex = valleyArenas.findIndex((candidate) => candidate.name === arena.name);
      if (sourceIndex >= 0) {
        arenaByLocalId.set(getLocalArenaId(arena, sourceIndex), arena._id);
      }
    });
    return arenaByLocalId;
  }

  const inserted = await Arena.insertMany(valleyArenas);
  const arenaByLocalId = new Map();
  inserted.forEach((arena, index) => {
    arenaByLocalId.set(getLocalArenaId(arena, index), arena._id);
  });
  return arenaByLocalId;
}

async function migrateUsers(localUsers) {
  const userIdMap = new Map();

  for (const localUser of localUsers) {
    let dbUser = await User.findOne({ email: localUser.email.trim().toLowerCase() });

    if (!dbUser) {
      dbUser = await User.create({
        name: localUser.name,
        email: localUser.email,
        password: localUser.password,
        role: localUser.role || 'user',
        phone: localUser.phone,
        profileImage: localUser.profileImage,
        position: localUser.position || 'Any',
        skillLevel: localUser.skillLevel || 'Beginner',
        bio: localUser.bio,
        totalGamesPlayed: localUser.totalGamesPlayed || 0,
        isActive: localUser.isActive !== false,
      });
    } else {
      dbUser.name = localUser.name || dbUser.name;
      dbUser.password = localUser.password || dbUser.password;
      dbUser.role = localUser.role || dbUser.role;
      dbUser.phone = localUser.phone || dbUser.phone;
      dbUser.profileImage = localUser.profileImage || dbUser.profileImage;
      dbUser.position = localUser.position || dbUser.position;
      dbUser.skillLevel = localUser.skillLevel || dbUser.skillLevel;
      dbUser.bio = localUser.bio || dbUser.bio;
      dbUser.totalGamesPlayed = localUser.totalGamesPlayed || dbUser.totalGamesPlayed;
      dbUser.isActive = localUser.isActive !== false;
      await dbUser.save();
    }

    userIdMap.set(localUser._id, dbUser._id);
  }

  return userIdMap;
}

async function migrateBookings(localBookings, userIdMap, arenaIdMap) {
  let insertedCount = 0;

  for (const localBooking of localBookings) {
    const arenaId = arenaIdMap.get(localBooking.arena);
    const userId = userIdMap.get(localBooking.user);

    if (!arenaId || !userId) {
      continue;
    }

    const existingBooking = await Booking.findOne({
      arena: arenaId,
      user: userId,
      date: new Date(localBooking.date),
      startTime: localBooking.startTime,
      endTime: localBooking.endTime,
    });

    if (existingBooking) {
      continue;
    }

    const booking = await Booking.create({
      arena: arenaId,
      user: userId,
      date: new Date(localBooking.date),
      startTime: localBooking.startTime,
      endTime: localBooking.endTime,
      duration: localBooking.duration,
      totalPrice: localBooking.totalPrice,
      status: localBooking.status || 'confirmed',
      paymentStatus: localBooking.paymentStatus || 'pending',
      paymentMethod: localBooking.paymentMethod || 'cash',
      notes: localBooking.notes,
      cancellationReason: localBooking.cancellationReason || null,
      cancelledAt: localBooking.cancelledAt ? new Date(localBooking.cancelledAt) : null,
      cancelledBy: localBooking.cancelledBy ? userIdMap.get(localBooking.cancelledBy) || null : null,
    });

    await Arena.updateOne(
      { _id: arenaId },
      {
        $push: {
          timeSlots: {
            date: new Date(localBooking.date),
            startTime: localBooking.startTime,
            endTime: localBooking.endTime,
            isBooked: localBooking.status !== 'cancelled',
            bookingId: localBooking.status !== 'cancelled' ? booking._id : null,
          },
        },
      }
    );

    insertedCount += 1;
  }

  return insertedCount;
}

async function main() {
  const localStore = readLocalStore();

  await mongoose.connect(process.env.MONGO_URI.trim());

  const arenaIdMap = await ensureArenaSeed();
  const userIdMap = await migrateUsers(localStore.users || []);
  const insertedBookings = await migrateBookings(localStore.bookings || [], userIdMap, arenaIdMap);

  console.log(`MongoDB connected: ${process.env.MONGO_URI.trim()}`);
  console.log(`Users migrated: ${userIdMap.size}`);
  console.log(`Bookings migrated: ${insertedBookings}`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Migration failed:', error);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {}
  process.exit(1);
});
