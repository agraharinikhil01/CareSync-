const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });
require('dotenv').config();
const app = require('../backend/src/app');
const connectDB = require('../backend/src/config/db');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};
