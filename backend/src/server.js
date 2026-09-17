const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./utils/socket');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO on HTTP server
initSocket(server);

// Connect to MongoDB Atlas
connectDB().then(() => {
  if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
      console.log(`🚀 CareSync / HospitalRadar Server running on http://localhost:${PORT}`);
    });
  }
}).catch((err) => {
  console.error('Fatal Database Connection Error:', err.message);
  process.exit(1);
});

module.exports = { app, server };

