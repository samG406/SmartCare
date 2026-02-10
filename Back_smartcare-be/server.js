const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const { verifyToken, authorizeRoles } = require("./middleware/authMiddleware");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./config/db.auth");
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const timingsRoutes = require('./routes/timings');

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://smart-care-ashy.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use((req, res, next) => {
  if (!res.get('Content-Type')) {
    res.set('Content-Type', 'application/json; charset=utf-8');
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/patients', patientRoutes);
app.use('/api/patient', patientRoutes);
app.use('/doctors', doctorRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/timings', timingsRoutes);

app.delete("/appointments/:id", verifyToken, authorizeRoles("Admin"), (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM appointments WHERE appointment_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Appointment deleted successfully!" });
  });
});

app.delete("/appointments/:id/cancel", verifyToken, authorizeRoles("Admin", "Patient"), (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const userRole = (req.user?.role || '').toLowerCase();

  if (userRole === 'admin') {
    db.query("DELETE FROM appointments WHERE appointment_id = ?", [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!result || result.affectedRows === 0) return res.status(404).json({ error: "Appointment not found." });
      return res.json({ message: "Appointment cancelled successfully!" });
    });
    return;
  }

  if (!userId) return res.status(400).json({ error: "userId is required" });

  const patientSql = "SELECT patient_id FROM patients WHERE user_id = ? LIMIT 1";
  db.query(patientSql, [userId], (pErr, pRows) => {
    if (pErr) return res.status(500).json({ error: pErr.message });
    if (!pRows || pRows.length === 0) return res.status(404).json({ error: "Patient not found." });

    const patientId = pRows[0].patient_id;
    const checkSql = "SELECT appointment_id FROM appointments WHERE appointment_id = ? AND patient_id = ? LIMIT 1";
    db.query(checkSql, [id, patientId], (cErr, cRows) => {
      if (cErr) return res.status(500).json({ error: cErr.message });
      if (!cRows || cRows.length === 0) {
        return res.status(403).json({ error: "Access Denied. Appointment does not belong to this patient." });
      }

      db.query("DELETE FROM appointments WHERE appointment_id = ?", [id], (dErr, result) => {
        if (dErr) return res.status(500).json({ error: dErr.message });
        if (!result || result.affectedRows === 0) return res.status(404).json({ error: "Appointment not found." });
        return res.json({ message: "Appointment cancelled successfully!" });
      });
    });
  });
});

app.get("/", (req, res) => {
  res.json({ message: "SmartHealthcare API is running!" });
});

app.get("/appointments/by-user/:userId", (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  const findPatientSql = "SELECT patient_id FROM patients WHERE user_id = ? LIMIT 1";
  db.query(findPatientSql, [userId], (findErr, rows) => {
    if (findErr) return res.status(500).json({ error: findErr.message });
    if (!rows || rows.length === 0) return res.json([]);

    const patientId = rows[0].patient_id;
    const apptSql = `
      SELECT 
        a.appointment_id,
        a.patient_id,
        a.doctor_id,
        a.appointment_date,
        a.status,
        a.appointment_type,
        a.notes,
        u.full_name AS doctor_name,
        d.department AS doctor_department
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
      LEFT JOIN users u ON d.user_id = u.user_id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date ASC
    `;
    db.query(apptSql, [patientId], (apptErr, results) => {
      if (apptErr) return res.status(500).json({ error: apptErr.message });
      res.json(results || []);
    });
  });
});

app.get("/appointments/by-doctor/:doctorId", verifyToken, authorizeRoles("Doctor", "Admin"), (req, res) => {
  const { doctorId } = req.params;
  if (!doctorId) return res.status(400).json({ error: "doctorId is required" });

  const userRole = (req.user?.role || '').toLowerCase();
  const userId = req.user?.userId;
  if (userRole === 'doctor') {
    const checkSql = "SELECT doctor_id FROM doctors WHERE doctor_id = ? AND user_id = ? LIMIT 1";
    db.query(checkSql, [doctorId, userId], (checkErr, rows) => {
      if (checkErr) return res.status(500).json({ error: checkErr.message });
      if (!rows || rows.length === 0) {
        return res.status(403).json({ error: "Access Denied. You do not have permission." });
      }
      const sql = `
        SELECT 
          a.appointment_id,
          a.patient_id,
          a.doctor_id,
          a.appointment_date,
          a.status,
          a.appointment_type,
          a.notes,
          u.full_name AS patient_name,
          p.date_of_birth AS patient_date_of_birth,
          p.gender AS patient_gender
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.patient_id
        LEFT JOIN users u ON p.user_id = u.user_id
        WHERE a.doctor_id = ?
        ORDER BY a.appointment_date ASC
      `;
      db.query(sql, [doctorId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results || []);
      });
    });
    return;
  }

  const sql = `
    SELECT 
      a.appointment_id,
      a.patient_id,
      a.doctor_id,
      a.appointment_date,
      a.status,
      a.appointment_type,
      a.notes,
      u.full_name AS patient_name,
      p.date_of_birth AS patient_date_of_birth,
      p.gender AS patient_gender
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.patient_id
    LEFT JOIN users u ON p.user_id = u.user_id
    WHERE a.doctor_id = ?
    ORDER BY a.appointment_date ASC
  `;
  db.query(sql, [doctorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results || []);
  });
});

app.get("/appointments/by-doctor/:doctorId/slots", verifyToken, authorizeRoles("Patient", "Doctor", "Admin"), (req, res) => {
  const { doctorId } = req.params;
  if (!doctorId) return res.status(400).json({ error: "doctorId is required" });

  const sql = `
    SELECT appointment_id, doctor_id, appointment_date, status
    FROM appointments
    WHERE doctor_id = ?
    ORDER BY appointment_date ASC
  `;
  db.query(sql, [doctorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results || []);
  });
});

app.get("/medical-records", (req, res) => {
  db.query("SELECT * FROM medical_records", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/appointments", (req, res) => {
  const { patient_id, user_id, doctor_id, appointment_date, status, appointment_type, notes } = req.body;

  const alterSql = `
    ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS appointment_type ENUM('Consultation','Follow-up','New Patient') NULL,
      ADD COLUMN IF NOT EXISTS notes TEXT NULL;
  `;

  db.query(alterSql, (alterErr) => {
    if (alterErr && alterErr.code !== 'ER_PARSE_ERROR') {
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

app.post("/medical-records", (req, res) => {
  const { patient_id, doctor_id, diagnosis, prescription } = req.body;
  const sql = "INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription) VALUES (?, ?, ?, ?)";
  db.query(sql, [patient_id, doctor_id, diagnosis, prescription], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Medical record added successfully!", record_id: result.insertId });
  });
});

app.put("/appointments/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  const sql = `UPDATE appointments SET status = ? WHERE appointment_id = ?`;
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("SQL Error:", err.message);
      return res.status(500).json({ error: "Failed to update appointment" });
    }

    res.json({ message: "Appointment status updated successfully!" });
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

app.delete("/medical-records/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM medical_records WHERE record_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Medical record deleted successfully!" });
  });
});

const JWT_SECRET = process.env.JWT_SECRET || 'our_secret_key';

const PORT = process.env.PORT || 7070;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {});