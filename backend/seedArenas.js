const mongoose = require('mongoose');
require('dotenv').config();

const Arena = require('./models/arena');
const valleyArenas = require('./data/valleyArenas');

async function seedArenas() {
  try {
    await mongoose.connect(process.env.MONGO_URI.trim());
    console.log('MongoDB connected');

    await Arena.deleteMany({});
    console.log('Cleared existing arenas');

    const result = await Arena.insertMany(valleyArenas);
    console.log(`Inserted ${result.length} Kathmandu Valley arenas`);

    result.forEach((arena, index) => {
      console.log(`${index + 1}. ${arena.name} (${arena.location.city}) - NPR ${arena.price}/${arena.priceUnit}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding arenas:', error);
    process.exit(1);
  }
}

seedArenas();
