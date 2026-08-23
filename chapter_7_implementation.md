# Chapter 7: Implementation

## 7.1 Coding Approach

The CareSync Hospital Management System is architected using a decoupled **MERN (MongoDB, Express.js, React 18, Node.js) Full-Stack Client-Server Pattern** adhering strictly to the **MVC (Model-View-Controller)** architectural paradigm on the backend and **Component-Driven Architecture (CDA)** on the frontend:

- **Presentation Layer (Frontend)**: Built with **React 18, Vite, and Tailwind CSS**. Modular single-page dashboards handle role-specific states with React Context (`AuthContext`) and Axios interceptors for automated JWT authorization.
- **Application Layer (Backend)**: Built with **Node.js & Express.js RESTful API Framework**. Express routers decouple endpoints from business logic implemented inside dedicated controller functions (`authController`, `appointmentController`, `billingController`, `bedController`).
- **Data Persistence Layer (Database)**: Implemented using **Mongoose ODM (Object Data Modeling)** over **MongoDB Atlas**, enforcing strong schema validations, virtual references, and cascading relationships.

---

## 7.2 Sample Model & Schema Definitions

The following excerpts illustrate how the core entities (**User / PatientProfile** and **Appointment**) are defined as robust Mongoose schemas with type validations, defaults, and foreign key references:

### 1. Patient Profile Schema (`server/models/PatientProfile.js`)
```javascript
const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [130, 'Please enter a realistic age'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relationship: { type: String, default: '' },
    },
    allergies: {
      type: [String],
      default: [],
    },
    medicalHistory: [
      {
        condition: { type: String, required: true },
        diagnosedDate: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
        treatedBy: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
```

### 2. Appointment Schema (`server/models/Appointment.js`)
```javascript
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'In-Consultation'],
      default: 'Scheduled',
    },
    symptoms: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
```

---

## 7.3 Authentication & Security Mechanisms

- **Bcrypt Password Hashing**: Passwords are never stored in plaintext. Pre-save Mongoose middleware hashes passwords using `bcryptjs` with an automated salt round of 10 (`salt = await bcrypt.genSalt(10)`).
- **Stateless JWT Authorization**: Upon authentication, a signed **JSON Web Token (JWT)** is issued containing the user identifier. Protected endpoints verify authorization headers via `authMiddleware.js`.
- **Role-Based Access Control (RBAC)**: Fine-grained authorization middleware (`authorize('admin', 'doctor')`) ensures users cannot elevate privileges or access endpoints outside their assigned role tier.
- **HTTP Security & Rate Limiting**:
  - `helmet`: Sets secure HTTP response headers (XSS filter, anti-clickjacking, HSTS).
  - `express-rate-limit`: Prevents brute-force credential stuffing and DoS attacks by capping requests to 300 requests per 15-minute window per IP.
  - `CORS`: Restricts unauthorized cross-origin resource requests.
- **NoSQL Injection Mitigation**: Mongoose strictly sanitizes and validates query parameters against defined schema types, disallowing arbitrary operator injection.

---

## 7.4 Coding Standards & Conventions

- **Modular Folder Architecture**: Distinct separation of concerns between `controllers/`, `routes/`, `models/`, `middleware/`, and `config/` on the server, and `components/`, `pages/`, `context/`, and `api/` on the client.
- **ES6+ Modern JavaScript**: Adoption of async/await syntax, arrow functions, object destructuring, and optional chaining (`?.`) throughout.
- **RESTful Design Principles**: Endpoints follow standard HTTP verb conventions (`GET`, `POST`, `PUT`, `DELETE`) and uniform JSON response envelopes (`{ success: true, data: ... }`).
- **Tailwind CSS Utility Design**: Responsive, mobile-first styling system adhering to consistent design tokens (typography, color palettes, spacing).
