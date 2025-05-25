// db/connection.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.MONGO_URL) {
  throw new Error("❌ MONGO_URL is not defined in environment variables.");
}

export const connectDB = async () => {
  try {
    console.log('🟡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🟢 MongoDB connected.');
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected.');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed due to app termination.');
      process.exit(0);
    });

  } catch (err) {
    console.error('🔴 MongoDB connection error:', err);
    process.exit(1); // Exit on failure
  }
};
