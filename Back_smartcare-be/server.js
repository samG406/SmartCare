const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const { verifyToken, authorizeRoles } = require("./middleware/authMiddleware");// Import middleware
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./config/db.auth");// Add these near the top of your server.js, after your middleware declarations
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const timingsRoutes = require('./routes/timings');

const app = express();

// CORS configuration - allow both localhost (dev) and production frontend
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://smart-care-ashy.vercel.app",
  process.env.FRONTEND_URL, // Your production frontend URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log the origin for debugging
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
// Mount patient and doctor routers
app.use('/patients', patientRoutes);        // CRUD: /patients
app.use('/api/patient', patientRoutes);     // profile: /api/patient/profile
app.use('/doctors', doctorRoutes);          // CRUD: /doctors
app.use('/api/doctor', doctorRoutes);       // profile: /api/doctor/profile
app.use('/api/timings', timingsRoutes);     // timings endpoints






// routes moved to routes/patients.js

// routes moved to routes/doctors.js

// Protect deleting appointments - Only Admin can access
app.delete("/appointments/:id", verifyToken, authorizeRoles("Admin"), (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM appointments WHERE appointment_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Appointment deleted successfully!" });
  });
});

// API Routes
app.get("/", (req, res) => {
  res.json({ message: "SmartHealthcare API is running!" });
});
/*
// User Signup Route
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      console.error("Signup error:", err.message);
      
      // ✅ Friendly error message for duplicate email
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Email already registered." });
      }

      return res.status(500).json({ error: "Signup failed. Please try again." });
    }

    res.status(201).json({ message: "Signup successful", user_id: result.insertId });
  });
});

// User Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("Login error:", err.message);
      return res.status(500).json({ error: "Login failed. Please try again." });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // ✅ Successful login
    res.status(200).json({ message: "Login successful", user: results[0] });
  });
});


*/
// patients and doctors GET moved to routers

// Fetch all appointments
app.get("/appointments", (req, res) => {
  db.query("SELECT * FROM appointments", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Fetch all medical records
app.get("/medical-records", (req, res) => {
  db.query("SELECT * FROM medical_records", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// creation moved to routers

// Add a new appointment
app.post("/appointments", (req, res) => {
  const { patient_id, user_id, doctor_id, appointment_date, status, appointment_type, notes } = req.body;

  // Ensure columns exist (MySQL 8+ supports IF NOT EXISTS)
  const alterSql = `
    ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS appointment_type ENUM('Consultation','Follow-up','New Patient') NULL,
      ADD COLUMN IF NOT EXISTS notes TEXT NULL;
  `;

  db.query(alterSql, (alterErr) => {
    if (alterErr && alterErr.code !== 'ER_PARSE_ERROR') {
      // Some MySQL variants may not support IF NOT EXISTS in ALTER; ignore parse error
      console.warn('ALTER TABLE appointments warning:', alterErr.message);
    }

    const allowedTypes = new Set(['consultation','follow-up','new patient']);
    const normType = (appointment_type || '').toString().toLowerCase();
    const finalType = allowedTypes.has(normType) ?
      (normType === 'consultation' ? 'Consultation' : normType === 'follow-up' ? 'Follow-up' : 'New Patient') : null;

    const insert = (resolvedPatientId) => {
      const sql = `INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, appointment_type, notes)
                   VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [resolvedPatientId, doctor_id, appointment_date, status || 'pending', finalType, notes || null];
      db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Appointment scheduled successfully!", appointment_id: result.insertId });
      });
    };

    if (patient_id) return insert(patient_id);

    if (!user_id) return res.status(400).json({ error: "patient_id or user_id is required" });

    const findSql = 'SELECT patient_id FROM patients WHERE user_id = ? LIMIT 1';
    db.query(findSql, [user_id], (findErr, rows) => {
      if (findErr) return res.status(500).json({ error: findErr.message });
      if (!rows || rows.length === 0) {
        return res.status(400).json({ error: 'Patient profile not found. Please complete patient profile first.' });
      }
      insert(rows[0].patient_id);
    });
  });
});

// Add a new medical record
app.post("/medical-records", (req, res) => {
  const { patient_id, doctor_id, diagnosis, prescription } = req.body;
  const sql = "INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription) VALUES (?, ?, ?, ?)";
  db.query(sql, [patient_id, doctor_id, diagnosis, prescription], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Medical record added successfully!", record_id: result.insertId });
  });
});
// Update Entries (PUT)
// updates moved to routers

// ✅ Simplified PUT: only updates status
app.put("/appointments/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;


  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  const sql = `UPDATE appointments SET status = ? WHERE appointment_id = ?`;
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("❌ SQL Error:", err.message); // 👈 very helpful
      return res.status(500).json({ error: "Failed to update appointment" });
    }

    res.json({ message: "✅ Appointment status updated successfully!" });
  });
});

app.put("/medical-records/:id", (req, res) => {
  const { id } = req.params;
  const { patient_id, doctor_id, diagnosis, prescription } = req.body;
  const sql = `UPDATE medical_records SET patient_id = ?, doctor_id = ?, diagnosis = ?, prescription = ? WHERE record_id = ?`;
  const values = [patient_id, doctor_id, diagnosis, prescription, id];
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Medical record updated successfully!" });
  });
});

// Delete Entries (DELETE)
// deletes moved to routers

app.delete("/appointments/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM appointments WHERE appointment_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Appointment deleted successfully!" });
  });
});

app.delete("/medical-records/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM medical_records WHERE record_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Medical record deleted successfully!" });
  });
});

// Note: Patient profile route is handled by patientRoutes at /api/patient/profile



const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Start Server
// Elastic Beanstalk sets PORT environment variable
const PORT = process.env.PORT || 7070;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});