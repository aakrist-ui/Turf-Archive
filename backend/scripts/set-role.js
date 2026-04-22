const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();
const { findUserByEmail, updateUser } = require('../utils/localDevStore');

const [, , email, role] = process.argv;
const allowedRoles = ['user', 'owner', 'admin'];

async function run() {
  if (!email || !role) {
    console.log('Usage: node scripts/set-role.js <email> <user|owner|admin>');
    process.exit(1);
  }

  if (!allowedRoles.includes(role)) {
    console.log(`Invalid role. Use one of: ${allowedRoles.join(', ')}`);
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: { role } },
      { returnDocument: 'after' },
    ).select('name email role isActive');
  } catch (error) {
    const existingUser = findUserByEmail(normalizedEmail);
    user = existingUser ? updateUser(existingUser._id, { role }) : null;
  }

  if (!user) {
    console.log(`User not found: ${email}`);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {}
    process.exit(1);
  }

  console.log('Updated user role:');
  console.log(JSON.stringify(user, null, 2));

  try {
    await mongoose.disconnect();
  } catch (disconnectError) {}
}

run().catch(async (error) => {
  console.error('Failed to update role:', error.message);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error('Disconnect error:', disconnectError.message);
  }
  process.exit(1);
});
