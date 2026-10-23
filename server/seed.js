import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Vendor from './models/Vendor.js';
import MenuItem from './models/MenuItem.js';
import Order from './models/Order.js';
import { initialStalls, initialMenuItems } from './data/seedData.js';

dotenv.config();

const runSeed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const connected = await connectDB();
    if (!connected) {
      console.log('Cannot connect to MongoDB. Skipping database write.');
      process.exit(1);
    }

    console.log('Clearing existing collections...');
    await Vendor.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});

    console.log('Inserting Kirba Chowk stalls...');
    await Vendor.insertMany(initialStalls);

    console.log('Inserting delicious menu items...');
    await MenuItem.insertMany(initialMenuItems);

    console.log('✅ Successfully seeded KFC database!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

runSeed();
