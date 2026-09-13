const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });
require('dotenv').config();
const app = require('../backend/src/app');
const connectDB = require('../backend/src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection error in serverless handler:', error.message);
    return res.status(503).json({
      success: false,
      message: 'Database is warming up. Please refresh or try again in a few seconds.',
    });
  }
  return app(req, res);
};
