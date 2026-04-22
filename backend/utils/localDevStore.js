const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '..', 'data', 'local-dev-db.json');

const defaultStore = () => ({
  users: [],
  bookings: [],
  arenas: [],
});

const ensureStoreFile = () => {
  const dir = path.dirname(storePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify(defaultStore(), null, 2));
  }
};

const readStore = () => {
  ensureStoreFile();

  try {
    const raw = fs.readFileSync(storePath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
      arenas: Array.isArray(parsed.arenas) ? parsed.arenas : [],
    };
  } catch (error) {
    return defaultStore();
  }
};

const writeStore = (store) => {
  ensureStoreFile();
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
};

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const sortByCreatedAtDesc = (items) =>
  [...items].sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));

exports.storePath = storePath;
exports.makeId = makeId;

exports.getUsers = () => readStore().users;
exports.findUserByEmail = (email) =>
  readStore().users.find((user) => user.email === email) || null;
exports.findUserById = (id) =>
  readStore().users.find((user) => user._id === id) || null;
exports.createUser = (user) => {
  const store = readStore();
  const createdAt = new Date().toISOString();
  const record = {
    _id: user._id || makeId('user'),
    role: 'user',
    isActive: true,
    position: 'Any',
    skillLevel: 'Beginner',
    totalGamesPlayed: 0,
    currentTeam: null,
    createdAt,
    updatedAt: createdAt,
    ...user,
  };

  store.users.push(record);
  writeStore(store);
  return record;
};
exports.updateUser = (id, updates) => {
  const store = readStore();
  const index = store.users.findIndex((user) => user._id === id);

  if (index === -1) {
    return null;
  }

  store.users[index] = {
    ...store.users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  writeStore(store);
  return store.users[index];
};

exports.searchUsers = (query, excludeUserId) => {
  const normalizedQuery = query.trim().toLowerCase();

  return readStore().users
    .filter((user) => user._id !== excludeUserId && user.isActive !== false)
    .filter((user) => {
      if (!normalizedQuery) {
        return true;
      }

      return [user.name, user.email].some((value) =>
        String(value || '').toLowerCase().includes(normalizedQuery)
      );
    })
    .sort((left, right) => String(left.name || '').localeCompare(String(right.name || '')))
    .slice(0, 30);
};

exports.getBookings = () => readStore().bookings;
exports.findBookingById = (id) =>
  readStore().bookings.find((booking) => booking._id === id) || null;
exports.createBooking = (booking) => {
  const store = readStore();
  const createdAt = new Date().toISOString();
  const record = {
    _id: booking._id || makeId('booking'),
    status: 'confirmed',
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    createdAt,
    updatedAt: createdAt,
    ...booking,
  };

  store.bookings.push(record);
  writeStore(store);
  return record;
};
exports.updateBooking = (id, updates) => {
  const store = readStore();
  const index = store.bookings.findIndex((booking) => booking._id === id);

  if (index === -1) {
    return null;
  }

  store.bookings[index] = {
    ...store.bookings[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  writeStore(store);
  return store.bookings[index];
};
exports.listBookingsForUser = (userId, status) =>
  sortByCreatedAtDesc(
    readStore().bookings.filter((booking) => {
      if (booking.user !== userId) {
        return false;
      }

      return status ? booking.status === status : true;
    })
  );

exports.listActiveBookingsForArenaSlot = (arenaId, date, startTime, endTime) =>
  readStore().bookings.find((booking) => {
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return (
      booking.arena === arenaId &&
      bookingDate.getTime() === targetDate.getTime() &&
      booking.startTime === startTime &&
      booking.endTime === endTime &&
      booking.status !== 'cancelled'
    );
  }) || null;

exports.getCustomArenas = () => readStore().arenas;
exports.findCustomArenaById = (id) =>
  readStore().arenas.find((arena) => arena._id === id) || null;
exports.createCustomArena = (arena) => {
  const store = readStore();
  const createdAt = new Date().toISOString();
  const record = {
    _id: arena._id || makeId('arena'),
    createdAt,
    updatedAt: createdAt,
    timeSlots: Array.isArray(arena.timeSlots) ? arena.timeSlots : [],
    ...arena,
  };

  store.arenas.push(record);
  writeStore(store);
  return record;
};
exports.updateCustomArena = (id, updates) => {
  const store = readStore();
  const index = store.arenas.findIndex((arena) => arena._id === id);

  if (index === -1) {
    return null;
  }

  store.arenas[index] = {
    ...store.arenas[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  writeStore(store);
  return store.arenas[index];
};
exports.deleteCustomArena = (id) => {
  const store = readStore();
  const beforeCount = store.arenas.length;
  store.arenas = store.arenas.filter((arena) => arena._id !== id);
  writeStore(store);
  return beforeCount !== store.arenas.length;
};
