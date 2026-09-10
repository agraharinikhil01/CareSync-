const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB().then(() => {
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`🚀 CareSync HMS Backend Server running on http://localhost:${PORT}`);
    });
  }
}).catch((err) => {
  console.error('Fatal Database Connection Error:', err.message);
  process.exit(1);
});

module.exports = app;
