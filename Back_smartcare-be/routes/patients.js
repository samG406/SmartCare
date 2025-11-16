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
      if (findErr) {
        console.error('DB error (find patient):', findErr);
        return res.status(500).json({ 
          message: 'Server error',
          error: findErr.message || findErr.sqlMessage || 'Database error'
        });
      }

      if (rows && rows.length > 0) {
        const patientId = rows[0].patient_id;
        
        // Check if phone_number is already in use by another patient
        if (phone_number) {
          const checkPhoneSql = 'SELECT patient_id FROM patients WHERE phone_number = ? AND patient_id != ? LIMIT 1';
          db.query(checkPhoneSql, [phone_number, patientId], (checkErr, checkRows) => {
            if (checkErr) {
              console.error('DB error (check phone):', checkErr);
              if (!res.headersSent) {
                return res.status(500).json({ 
                  message: 'Server error',
                  error: checkErr.message || checkErr.sqlMessage || 'Database error'
                });
              }
              return;
            }
            
            if (checkRows && checkRows.length > 0) {
              if (!res.headersSent) {
                return res.status(400).json({ 
                  message: 'This phone number is already in use by another patient',
                  error: 'Phone number must be unique'
                });
              }
              return;
            }
            
            // Phone number is available, proceed with update
            const updateSql = `UPDATE patients
              SET date_of_birth = ?, gender = ?, phone_number = ?, address = ?, emergency_contact = ?
              WHERE patient_id = ?`;
            const updateValues = [date_of_birth || null, gender || null, phone_number || null, address || null, emergency_contact || null, patientId];
            db.query(updateSql, updateValues, (updErr) => {
              if (updErr) {
                console.error('DB error (update patient):', updErr);
                console.error('Error message:', updErr.message);
                console.error('Error sqlMessage:', updErr.sqlMessage);
                console.error('Error code:', updErr.code);
                console.error('SQL:', updateSql);
                console.error('Values:', updateValues);
                if (!res.headersSent) {
                  // Handle duplicate entry error specifically
                  if (updErr.code === 'ER_DUP_ENTRY') {
                    if (updErr.sqlMessage && updErr.sqlMessage.includes('phone_number')) {
                      return res.status(400).json({ 
                        message: 'This phone number is already in use by another patient',
                        error: updErr.sqlMessage
                      });
                    }
                  }
                  return res.status(500).json({ 
                    message: 'Failed to update profile',
                    error: updErr.message || updErr.sqlMessage || 'Database error',
                    code: updErr.code
                  });
                }
                return;
              }
              if (!res.headersSent) {
                return res.json({ message: 'Profile updated successfully', patient_id: patientId });
              }
            });
          });
        } else {
          // No phone number provided, proceed with update
          const updateSql = `UPDATE patients
            SET date_of_birth = ?, gender = ?, phone_number = ?, address = ?, emergency_contact = ?
            WHERE patient_id = ?`;
          const updateValues = [date_of_birth || null, gender || null, phone_number || null, address || null, emergency_contact || null, patientId];
          db.query(updateSql, updateValues, (updErr) => {
            if (updErr) {
              console.error('DB error (update patient):', updErr);
              console.error('Error message:', updErr.message);
              console.error('Error sqlMessage:', updErr.sqlMessage);
              console.error('Error code:', updErr.code);
              console.error('SQL:', updateSql);
              console.error('Values:', updateValues);
              if (!res.headersSent) {
                return res.status(500).json({ 
                  message: 'Failed to update profile',
                  error: updErr.message || updErr.sqlMessage || 'Database error',
                  code: updErr.code
                });
              }
              return;
            }
            if (!res.headersSent) {
              return res.json({ message: 'Profile updated successfully', patient_id: patientId });
            }
          });
        }
      } else {
        // Check if phone_number is already in use before inserting
        if (phone_number) {
          const checkPhoneSql = 'SELECT patient_id FROM patients WHERE phone_number = ? LIMIT 1';
          db.query(checkPhoneSql, [phone_number], (checkErr, checkRows) => {
            if (checkErr) {
              console.error('DB error (check phone):', checkErr);
              if (!res.headersSent) {
                return res.status(500).json({ 
                  message: 'Server error',
                  error: checkErr.message || checkErr.sqlMessage || 'Database error'
                });
              }
              return;
            }
            
            if (checkRows && checkRows.length > 0) {
              if (!res.headersSent) {
                return res.status(400).json({ 
                  message: 'This phone number is already in use by another patient',
                  error: 'Phone number must be unique'
                });
              }
              return;
            }
            
            // Phone number is available, proceed with insert
            const insertSql = `INSERT INTO patients (user_id, date_of_birth, gender, phone_number, address, emergency_contact)
              VALUES (?, ?, ?, ?, ?, ?)`;
            const insertValues = [user_id, date_of_birth || null, gender || null, phone_number || null, address || null, emergency_contact || null];
            db.query(insertSql, insertValues, (insErr, result) => {
              if (insErr) {
                console.error('DB error (insert patient):', insErr);
                console.error('Error message:', insErr.message);
                console.error('Error sqlMessage:', insErr.sqlMessage);
                console.error('Error code:', insErr.code);
                console.error('SQL:', insertSql);
                console.error('Values:', insertValues);
                if (!res.headersSent) {
                  // Handle duplicate entry error specifically
                  if (insErr.code === 'ER_DUP_ENTRY') {
                    if (insErr.sqlMessage && insErr.sqlMessage.includes('phone_number')) {
                      return res.status(400).json({ 
                        message: 'This phone number is already in use by another patient',
                        error: insErr.sqlMessage
                      });
                    }
                  }
                  return res.status(500).json({ 
                    message: 'Failed to save profile',
                    error: insErr.message || insErr.sqlMessage || 'Database error',
                    code: insErr.code
                  });
                }
                return;
              }
              if (!res.headersSent) {
                return res.status(201).json({ message: 'Profile created successfully', patient_id: result.insertId });
              }
            });
          });
        } else {
          // No phone number provided, proceed with insert
          const insertSql = `INSERT INTO patients (user_id, date_of_birth, gender, phone_number, address, emergency_contact)
            VALUES (?, ?, ?, ?, ?, ?)`;
          const insertValues = [user_id, date_of_birth || null, gender || null, phone_number || null, address || null, emergency_contact || null];
          db.query(insertSql, insertValues, (insErr, result) => {
            if (insErr) {
              console.error('DB error (insert patient):', insErr);
              console.error('Error message:', insErr.message);
              console.error('Error sqlMessage:', insErr.sqlMessage);
              console.error('Error code:', insErr.code);
              console.error('SQL:', insertSql);
              console.error('Values:', insertValues);
              if (!res.headersSent) {
                return res.status(500).json({ 
                  message: 'Failed to save profile',
                  error: insErr.message || insErr.sqlMessage || 'Database error',
                  code: insErr.code
                });
              }
              return;
            }
            if (!res.headersSent) {
              return res.status(201).json({ message: 'Profile created successfully', patient_id: result.insertId });
            }
          });
        }
      }
    });
  } catch (e) {
    console.error('Profile save error:', e);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Server error', error: e instanceof Error ? e.message : 'Unknown error' });
    }
  }
});

module.exports = router;


