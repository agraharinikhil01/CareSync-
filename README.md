# 🏥 CareSync & HospitalRadar
### Real-Time Hospital Discovery + Hospital Management System (HMS) + ClinicOCR

A unified, production-grade healthcare ecosystem combining a **RailRadar-inspired live hospital discovery grid**, multi-hospital coordination (inspired by **HospiSync**), and the **ClinicOCR** medical document digitization platform.

---

## 🌟 Highlights & Features

### 1. HospitalRadar — Real-Time Discovery Grid
- **RailRadar-Style Interactive Map:** OpenStreetMap + Leaflet interactive radar map with real-time capacity-based pins.
  - 🟢 **Green Pin:** Good availability (&gt;5 general/ICU beds).
  - 🟡 **Yellow Pin:** Limited capacity (1–5 beds remaining).
  - 🔴 **Red Pin:** Hospital capacity full or emergency redirect active.
  - ⚪ **Grey Pin:** Outdated or unverified data.
- **Geospatial Proximity Matching:** MongoDB 2dsphere index calculating distance in kilometers and estimated driving times.
- **Bi-Directional Real-Time Sync:** Socket.IO emits immediate updates when any hospital admin changes bed capacity. Patient discovery maps update automatically with zero page reloads.
- **Transparent Recommendation Criteria:** Explains why each facility is recommended (e.g., *"2.4 km away • 6 ICU Beds Available • 24/7 Trauma Team"*).
- **🚨 Rapid Emergency Mode:** 1-click trauma & cardiac triage connecting patients immediately to the nearest hospital with available ICU and trauma facilities.

### 2. HospiSync-Inspired Inter-Hospital Transfers
- Inter-hospital patient referral and bed reservation workflows across facilities.
- Real-time status tracking (`PENDING`, `ACCEPTED`, `REJECTED`, `IN_TRANSIT`, `COMPLETED`).
- Coordinated multi-hospital notifications over Socket.IO rooms.

### 3. Role-Based Access Control (RBAC)
- **Patient (`PATIENT`):** Live map discovery, radius filtering, 1-click emergency assistance, doctor appointment booking, personal prescriptions, and ClinicOCR personal chart.
- **Hospital Admin (`HOSPITAL_ADMIN`):** Command center with real-time bed capacity counters, category-by-category bed management (General, ICU, Emergency, Isolation, Private), doctor roster, department setup, and transfer coordinator.
- **Doctor (`DOCTOR`):** Today's appointments schedule, clinical prescriptions, patient history, and ClinicOCR document digitization.
- **Receptionist (`RECEPTIONIST`):** Patient registration, appointment bookings, bed check-ins/check-outs, and ClinicOCR.
- **System Admin (`ADMIN`):** Network oversight, hospital verification workflow (`PENDING` $\to$ `VERIFIED` / `REJECTED`), and platform analytics.

### 4. ClinicOCR (100% Intact)
- Converts handwritten paper prescriptions into structured digital medical records in seconds.
- Multi-stage image preprocessing via Sharp (auto-rotation, contrast normalization, text sharpening).
- Client-side Tesseract OCR with word-level confidence evaluation.
- Google Gemini 1.5 Flash clinical summarization into structured medicine dosage, frequency, and tags.
- Direct linking to patient charts with scanned prescription persistence.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, React Router v7, Tailwind CSS v4, Lucide React, Leaflet & React-Leaflet, Socket.IO Client, Axios, React Hot Toast.
- **Backend:** Node.js, Express 5, MongoDB Atlas & Mongoose, Socket.IO, JWT Authentication, bcryptjs, Helmet, Morgan.
- **AI & OCR:** Google Gemini 1.5 Flash, Tesseract.js.

---

## 🚀 Getting Started

### 1. Environment Setup

#### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRE=30d
GEMINI_API_KEY=<your_gemini_api_key>
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

### 2. Install Dependencies & Seed Data

```bash
# Backend
cd backend
npm install
node src/utils/seedHospitals.js   # Seeds demo hospitals & credentials
npm run dev

# Frontend (in separate terminal)
cd frontend
npm install
npm run dev
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@caresync.com` | `Admin@123` |
| **Hospital Admin** | `hospital@caresync.com` | `Hospital@123` |
| **Doctor** | `doctor1@caresync.com` | `Doctor@123` |
| **Receptionist** | `receptionist@caresync.com` | `Staff@123` |
| **Patient** | `patient1@caresync.com` | `Patient@123` |

*Note: You can also use the one-click demo role selector on the login page.*
