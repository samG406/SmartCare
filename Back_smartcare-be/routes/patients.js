const express = require('express');
const router = express.Router();
const db = require('../config/db.auth');

// GET /patients (mounted at /patients)
router.get('/', (req, res) => {
  db.query(
    `SELECT p.*, u.full_name 
     FROM patients p 
     LEFT JOIN users u ON p.user_id = u.user_id`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// POST /patients - create basic patient row
router.post('/', (req, res) => {
  const { name, email, phone, date_of_birth, gender, address } = req.body;
  const sql = 'INSERT INTO patients (name, email, phone, date_of_birth, gender, address) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, email, phone, date_of_birth, gender, address], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Patient added successfully!', patient_id: result.insertId });
  });
});

// PUT /patients/:id - update basic patient fields
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, date_of_birth, gender, address } = req.body;
  const sql = 'UPDATE patients SET name = ?, email = ?, phone = ?, date_of_birth = ?, gender = ?, address = ? WHERE patient_id = ?';
  const values = [name, email, phone, date_of_birth, gender, address, id];
  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Patient updated successfully!' });
  });
});

// DELETE /patients/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM patients WHERE patient_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Patient deleted successfully!' });
  });
});

// GET /api/patient/profile - Get patient profile by user_id
router.get('/profile', (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ message: 'user_id is required' });

    const findSql = 'SELECT patient_id, date_of_birth, gender, phone_number, address, emergency_contact FROM patients WHERE user_id = ? LIMIT 1';
    db.query(findSql, [user_id], (err, rows) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      if (!rows || rows.length === 0) {
        return res.json({ profile: null });
      }
      return res.json({
        profile: {
          date_of_birth: rows[0].date_of_birth || '',
          gender: rows[0].gender || '',
          phone_number: rows[0].phone_number || '',
          address: rows[0].address || '',
          emergency_contact: rows[0].emergency_contact || ''
        }
      });
    });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/patient/profile (mount this router also at /api/patient)
router.post('/profile', (req, res) => {
  try {
    const { user_id, date_of_birth, gender, phone_number, address, emergency_contact } = req.body;
    if (!user_id) return res.status(400).json({ message: 'user_id is required' });

    const findSql = 'SELECT patient_id FROM patients WHERE user_id = ? LIMIT 1';
    db.query(findSql, [user_id], (findErr, rows) => {
      if (findErr) return res.status(500).json({ message: 'Server error' });

      if (rows && rows.length > 0) {
        const patientId = rows[0].patient_id;
        const updateSql = `UPDATE patients
          SET date_of_birth = ?, gender = ?, phone_number = ?, address = ?, emergency_contact = ?
          WHERE patient_id = ?`;
        const updateValues = [date_of_birth || null, gender || null, phone_number || null, address || null, emergency_contact || null, patientId];
        db.query(updateSql, updateValues, (updErr) => {
          if (updErr) return res.status(500).json({ message: 'Failed to update profile' });
          return res.json({ message: 'Profile updated successfully', patient_id: patientId });
        });
      } else {
        const insertSql = `INSERT INTO patients (user_id, date_of_birth, gender, phone_number, address, emergency_contact)
          VALUES (?, ?, ?, ?, ?, ?)`;
        const insertValues = [user_id, date_of_birth || null, gender || null, phone_number || null, address || null, emergency_contact || null];
        db.query(insertSql, insertValues, (insErr, result) => {
          if (insErr) return res.status(500).json({ message: 'Failed to save profile' });
          return res.status(201).json({ message: 'Profile created successfully', patient_id: result.insertId });
        });
      }
    });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


