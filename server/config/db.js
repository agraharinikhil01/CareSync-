const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) return mongoose.connection;

  try {
    const mongoUri =
      process.env.MONGO_URI ||
      'mongodb+srv://agraharinikhil999_db_user:rFWNmW2suPWDyDfV@cluster0.panlxcw.mongodb.net/hospital_management?retryWrites=true&w=majority&appName=Cluster0';

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Continuing without crashing in non-fatal mode...');
    }
  }
};

module.exports = connectDB;
