# CareSync HMS - Full-Stack Hospital Management System

> **Production-Grade, Modular Hospital Management System (HMS)** built with React 18, Vite, Tailwind CSS, Node.js, Express, and MongoDB.

📖 **Detailed Features Documentation:** See [FEATURES_OVERVIEW.md](./FEATURES_OVERVIEW.md) for full deep-dives into all 4 deployed features, real-world utility, and RBAC matrix.

---

## 🌟 Key System Capabilities & Architecture

CareSync HMS provides an end-to-end hospital administration workflow with **Role-Based Access Control (RBAC)** across 4 distinct user tiers:

1. **Admin**:
   - Master Analytics Dashboard with real-time occupancy rates, patient intake, revenue charts (Recharts), and consultation distributions.
   - Doctor & Staff Management (CRUD, department assignments, consultation fees, active status toggle).
   - Bed & Room Inventory (ICU, General Ward, Private Rooms, Emergency suites).
   - Financial overview with historical billing logs.

2. **Doctor**:
   - Live daily consultation queue & appointment status management.
   - Patient Electronic Health Record (EHR) review, past medical histories, and known allergies.
   - Interactive Electronic Prescription (E-Rx) Generator with dynamic medicine dosage calculators, lab test requisitions, and print-ready medical letterheads.

3. **Patient**:
   - Self-registration & portal account management.
   - Search doctor directory with specialty and department filters.
   - Self-service appointment booking with slot collision checks.
   - Digital prescription archive & itemized tax invoice checkout.

4. **Receptionist / Billing Staff**:
   - Front-desk on-counter patient intake & EHR profile creation.
   - Manual appointment booking for walk-ins.
   - Bed allocation and admission management with one-click discharge.
   - Custom itemized hospital invoice generation (consultation, room charges, tests, medicines, taxes, discounts).

---

## 🏗️ Project Structure

```
hospital-management-system/
├── client/                     # Frontend (React 18, Vite, Tailwind CSS)
│   ├── public/
│   ├── src/
│   │   ├── api/                # Axios client & centralized endpoint functions
│   │   │   ├── axios.js
│   │   │   └── endpoints.js
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── PrescriptionModal.jsx
│   │   │   ├── InvoiceModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/            # Authentication & session state
│   │   │   └── AuthContext.jsx
│   │   ├── pages/              # Role dashboards & auth views
│   │   │   ├── auth/           # Login & Register
│   │   │   ├── admin/          # AdminDashboard.jsx
│   │   │   ├── doctor/         # DoctorDashboard.jsx
│   │   │   ├── patient/        # PatientDashboard.jsx
│   │   │   └── receptionist/   # ReceptionistDashboard.jsx
│   │   ├── App.jsx             # Main Router & Protected Routes
│   │   ├── index.css           # Tailwind base styles & print media styles
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── vercel.json
│
├── server/                     # Backend (Node.js, Express, MongoDB)
│   ├── config/
│   │   └── db.js               # MongoDB connection handler
│   ├── controllers/            # Modular MVC Controllers
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   ├── appointmentController.js
│   │   ├── prescriptionController.js
│   │   ├── billingController.js
│   │   └── bedController.js
│   ├── middleware/             # JWT & RBAC Middlewares
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/                 # Mongoose Schemas with Validations
│   │   ├── User.js
│   │   ├── DoctorProfile.js
│   │   ├── PatientProfile.js
│   │   ├── Appointment.js
│   │   ├── Prescription.js
│   │   ├── Billing.js
│   │   └── Bed.js
│   ├── routes/                 # Express API Endpoints
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── prescriptionRoutes.js
│   │   ├── billingRoutes.js
│   │   └── bedRoutes.js
│   ├── seeder/
│   │   └── seedData.js         # Comprehensive demo database seeder
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Express API entry point
│
├── package.json                # Root orchestration package.json
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB community server or MongoDB Atlas URI

### 2. Installation
Install all dependencies (root, backend, frontend):
```bash
npm run install-all
```
*(Or navigate to `/server` and `/client` individually and run `npm install`)*

### 3. Environment Variables
Create `.env` in the `server/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/hospital_management
JWT_SECRET=super_secret_jwt_key_hms_production_2026_change_in_prod
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 4. Seed Database with Realistic Demo Data
Populate doctors, staff, patients, beds, appointments, prescriptions, and billing:
```bash
npm run seed
```

### 5. Start Development Servers
Run backend and frontend simultaneously with hot-reload:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hospital.com` | `Admin@123` | Full administrative control, financials & analytics |
| **Doctor** | `doctor.sharma@hospital.com` | `Doctor@123` | Senior Cardiologist with active queue |
| **Doctor** | `doctor.watson@hospital.com` | `Doctor@123` | Neurologist |
| **Receptionist** | `receptionist@hospital.com` | `Staff@123` | Front-desk intake, bed allocator & cashier |
| **Patient** | `patient.rahul@gmail.com` | `Patient@123` | Admitted patient with medical history |

*(Tip: The login screen contains one-click demo pill shortcuts to automatically fill credentials!)*

---

## 🚀 Production Deployment Guide

### A. Backend on Render / Railway
1. Push your repository to GitHub.
2. In Render, create a new **Web Service** connected to your repository.
3. Root Directory: `server`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `mongodb+srv://<user>:<password>@cluster0.mongodb.net/hospital_management?retryWrites=true&w=majority`
   - `JWT_SECRET` = `<Generate a 32+ character random string>`
   - `CLIENT_URL` = `https://your-frontend-domain.vercel.app`

### B. MongoDB Atlas Connection
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a user with read/write permissions.
3. Under **Network Access**, whitelist `0.0.0.0/0` (allow access from anywhere).
4. Copy the connection string and set it in `MONGO_URI`.

### C. Frontend on Vercel
1. In Vercel, import the repository and select the **`client`** folder as Root Directory.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://your-backend-render-app.onrender.com/api`
6. Click **Deploy**.

---

## 🛡️ Security Features
- **JWT Authentication**: Token stored securely with expiration verification.
- **Bcrypt Hashing**: 10-round salted password hashing on model pre-save.
- **Role-Based Access Control**: Route-level and controller-level authorization gates.
- **Helmet**: Secures HTTP response headers.
- **Rate Limiting**: Protects endpoints from DDoS and brute force attempts.
- **Input Validation**: Schema constraints and Mongoose type checking.
