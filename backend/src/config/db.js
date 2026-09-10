const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const mongoUri =
      process.env.MONGO_URI ||
      'mongodb+srv://hms:Hospital999@cluster0.panlxcw.mongodb.net/hospital_management?retryWrites=true&w=majority&appName=Cluster0';

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

module.exports = connectDB;
