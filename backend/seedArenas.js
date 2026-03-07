const mongoose = require('mongoose');
require('dotenv').config();

const Arena = require('./models/Arena');

const sampleArenas = [
  {
    name: "Labim Futsal",
    location: {
      address: "Labim Mall, Pulchowk",
      city: "Lalitpur",
      coordinates: {
        latitude: 27.6767,
        longitude: 85.3186
      }
    },
    description: "Premium indoor futsal arena at Labim Mall with modern facilities",
    price: 2000,
    priceUnit: "per hour",
    images: [
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800",
    ],
    facilities: ["Parking", "Changing Room", "Lights", "Cafeteria", "Shower", "Locker"],
    surfaceType: "Artificial Turf",
    capacity: 10,
    rating: 4.6,
    totalRatings: 320,
    openingTime: "06:00",
    closingTime: "22:00",
    isActive: true
  },
  {
    name: "Kick Off Futsal",
    location: {
      address: "Thapathali, Kathmandu",
      city: "Kathmandu",
      coordinates: {
        latitude: 27.6935,
        longitude: 85.3240
      }
    },
    description: "Popular futsal arena in Thapathali with good facilities",
    price: 1500,
    priceUnit: "per hour",
    images: [
      "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800",
    ],
    facilities: ["Parking", "Changing Room", "Lights", "Water"],
    surfaceType: "Artificial Turf",
    capacity: 10,
    rating: 4.3,
    totalRatings: 185,
    openingTime: "06:00",
    closingTime: "21:00",
    isActive: true
  },
  {
    name: "Pulchowk Futsal",
    location: {
      address: "Pulchowk, Lalitpur",
      city: "Lalitpur",
      coordinates: {
        latitude: 27.6780,
        longitude: 85.3195
      }
    },
    description: "Well-maintained outdoor futsal ground in Pulchowk area",
    price: 1200,
    priceUnit: "per hour",
    images: [
      "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800",
    ],
    facilities: ["Parking", "Changing Room", "Lights", "First Aid"],
    surfaceType: "Artificial Turf",
    capacity: 12,
    rating: 4.1,
    totalRatings: 142,
    openingTime: "06:00",
    closingTime: "21:00",
    isActive: true
  },
  {
    name: "Sankhamul Futsal",
    location: {
      address: "Sankhamul, Kathmandu",
      city: "Kathmandu",
      coordinates: {
        latitude: 27.6900,
        longitude: 85.3365
      }
    },
    description: "Affordable futsal arena near Sankhamul area",
    price: 1000,
    priceUnit: "per hour",
    images: [
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800",
    ],
    facilities: ["Parking", "Lights", "Water"],
    surfaceType: "Artificial Turf",
    capacity: 10,
    rating: 3.9,
    totalRatings: 98,
    openingTime: "06:30",
    closingTime: "20:00",
    isActive: true
  },
  {
    name: "Sanepa Futsal Ground",
    location: {
      address: "Sanepa, Lalitpur",
      city: "Lalitpur",
      coordinates: {
        latitude: 27.6850,
        longitude: 85.3100
      }
    },
    description: "Community futsal ground in Sanepa with natural grass",
    price: 1300,
    priceUnit: "per hour",
    images: [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    ],
    facilities: ["Parking", "Changing Room", "Water", "Seating Area"],
    surfaceType: "Artificial Turf",
    capacity: 12,
    rating: 4.2,
    totalRatings: 156,
    openingTime: "06:00",
    closingTime: "21:00",
    isActive: true
  },
  {
    name: "Thamel Futsal Arena",
    location: {
      address: "Thamel, Kathmandu",
      city: "Kathmandu",
      coordinates: {
        latitude: 27.7172,
        longitude: 85.3120
      }
    },
    description: "Indoor futsal in the heart of Thamel",
    price: 1800,
    priceUnit: "per hour",
    images: [
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800",
    ],
    facilities: ["Parking", "Changing Room", "Lights", "Cafeteria", "WiFi"],
    surfaceType: "Indoor",
    capacity: 10,
    rating: 4.4,
    totalRatings: 210,
    openingTime: "07:00",
    closingTime: "22:00",
    isActive: true
  },
  {
    name: "Bouddha Futsal",
    location: {
      address: "Bouddha, Kathmandu",
      city: "Kathmandu",
      coordinates: {
        latitude: 27.7210,
        longitude: 85.3625
      }
    },
    description: "Spacious futsal ground near Bouddha Stupa",
    price: 1400,
    priceUnit: "per hour",
    images: [
      "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800",
    ],
    facilities: ["Parking", "Changing Room", "Lights", "Water", "Seating"],
    surfaceType: "Artificial Turf",
    capacity: 12,
    rating: 4.0,
    totalRatings: 127,
    openingTime: "06:00",
    closingTime: "21:00",
    isActive: true
  },
  {
    name: "Jawalakhel Futsal",
    location: {
      address: "Jawalakhel, Lalitpur",
      city: "Lalitpur",
      coordinates: {
        latitude: 27.6720,
        longitude: 85.3165
      }
    },
    description: "Popular futsal arena in Jawalakhel area",
    price: 1500,
    priceUnit: "per hour",
    images: [
      "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800",
    ],
    facilities: ["Parking", "Changing Room", "Lights", "Shower"],
    surfaceType: "Artificial Turf",
    capacity: 10,
    rating: 4.3,
    totalRatings: 178,
    openingTime: "06:00",
    closingTime: "21:30",
    isActive: true
  }
];

async function seedArenas() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    await Arena.deleteMany({});
    console.log('🗑️  Cleared existing arenas');

    // Insert sample arenas
    const result = await Arena.insertMany(sampleArenas);
    console.log(`✅ Added ${result.length} sample arenas`);

    console.log('\n📋 Sample Arenas:');
    result.forEach((arena, index) => {
      console.log(`${index + 1}. ${arena.name} - NPR ${arena.price}/${arena.priceUnit}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding arenas:', error);
    process.exit(1);
  }
}

seedArenas();