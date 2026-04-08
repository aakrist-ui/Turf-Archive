const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

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

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    { $set: { role } },
    { returnDocument: 'after' },
  ).select('name email role isActive');

  if (!user) {
    console.log(`User not found: ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log('Updated user role:');
  console.log(JSON.stringify(user, null, 2));

  await mongoose.disconnect();
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
