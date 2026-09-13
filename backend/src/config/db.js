const mongoose = require('mongoose');

const connectDB = async () => {
  // 1 = connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2 = connecting
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', resolve);
    });
    return mongoose.connection;
  }

  try {
    const mongoUri =
      process.env.MONGO_URI ||
      'mongodb+srv://hms:Hospital999@cluster0.panlxcw.mongodb.net/hospital_management?retryWrites=true&w=majority&appName=Cluster0';

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
