const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const bedRoutes = require('./routes/bedRoutes');
const billRoutes = require('./routes/billRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Security & Utility Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check API
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    success: true,
    message: '🏥 CareSync Hospital Management System API is healthy and operational!',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes (with dual /api and direct support)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/doctors', doctorRoutes);
app.use('/doctors', doctorRoutes);

app.use('/api/patients', patientRoutes);
app.use('/patients', patientRoutes);

app.use('/api/appointments', appointmentRoutes);
app.use('/appointments', appointmentRoutes);

app.use('/api/prescriptions', prescriptionRoutes);
app.use('/prescriptions', prescriptionRoutes);

app.use('/api/beds', bedRoutes);
app.use('/beds', bedRoutes);

app.use('/api/bills', billRoutes);
app.use('/bills', billRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
