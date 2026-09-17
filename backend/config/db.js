const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('[ShopNest] MONGO_URI not provided — running with in-memory store');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[ShopNest] MongoDB connection failed (${error.message}) — running with in-memory fallback`);
  }
};

module.exports = connectDB;