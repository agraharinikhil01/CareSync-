const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const billingRoutes = require('./routes/billingRoutes');
const bedRoutes = require('./routes/bedRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Load environment variables
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();


// Connect to MongoDB Database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://localhost:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting (General API rate limiter)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again in 15 minutes',
  },
});
app.use('/api', limiter);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Hospital Management System API',
  });
});

// Root & /api Landing Page
const apiStatusHandler = (req, res) => {
  if (req.accepts('html')) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CareSync HMS API - Server Online</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
          body { background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
          .card { background: #1e293b; border: 1px solid #334155; border-radius: 24px; padding: 40px; max-width: 600px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); text-align: center; }
          .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); padding: 6px 16px; border-radius: 9999px; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 20px; }
          .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; }
          h1 { font-size: 28px; font-weight: 800; margin-bottom: 12px; background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 28px; }
          .endpoints { text-align: left; background: #0f172a; border-radius: 16px; padding: 20px; border: 1px solid #334155; margin-bottom: 28px; }
          .endpoints h3 { font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 12px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; font-weight: 600; }
          .grid a { color: #38bdf8; text-decoration: none; padding: 6px 10px; background: #1e293b; border-radius: 8px; border: 1px solid #334155; transition: 0.2s; }
          .grid a:hover { border-color: #38bdf8; background: #0284c7; color: white; }
          .btn { display: inline-block; background: linear-gradient(135deg, #0284c7, #4f46e5); color: white; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 14px; transition: 0.2s; }
          .btn:hover { opacity: 0.9; transform: translateY(-1px); }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge"><div class="dot"></div> Backend API Active & Healthy</div>
          <h1>CareSync HMS Server</h1>
          <p>Production-Grade Full-Stack Hospital Management System REST API is running smoothly on Node.js, Express & MongoDB Atlas.</p>
          <div class="endpoints">
            <h3>Active API Modules</h3>
            <div class="grid">
              <a href="/api/health">🩺 /api/health</a>
              <a href="/api/beds">🛏️ /api/beds</a>
              <a href="/api/doctors/dashboard/metrics">👨‍⚕️ /api/doctors</a>
              <a href="/api/patients">🏥 /api/patients</a>
              <a href="/api/appointments">📅 /api/appointments</a>
              <a href="/api/prescriptions">💊 /api/prescriptions</a>
              <a href="/api/billing">💳 /api/billing</a>
              <a href="/api/ai/suggestions">🤖 /api/ai</a>
            </div>
          </div>
          <a href="http://localhost:5173" class="btn">🚀 Open Frontend Application (Port 5173)</a>
        </div>
      </body>
      </html>
    `);
  }

  res.status(200).json({
    success: true,
    service: 'CareSync Hospital Management System API',
    status: 'online',
    version: '1.0.0',
    documentation: 'See README.md and FEATURES_OVERVIEW.md for full REST endpoints',
    healthCheck: '/api/health',
    timestamp: new Date().toISOString(),
  });
};

app.get('/', apiStatusHandler);
app.get('/api', apiStatusHandler);

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/ai', aiRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Hospital Management Server running on port: ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🩺 Health check at: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;

