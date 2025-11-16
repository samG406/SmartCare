const express = require('express');
const router = express.Router();
const db = require('../config/db.auth');

// GET /doctors
router.get('/', (req, res) => {
  db.query(
    `SELECT d.*, u.full_name 
     FROM doctors d 
     LEFT JOIN users u ON d.user_id = u.user_id`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// POST /doctors
router.post('/', (req, res) => {
  const { user_id, title, department, experience, mobile, hospital_affiliation } = req.body;
  
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  
  const sql = 'INSERT INTO doctors (user_id, title, department, experience, mobile, hospital_affiliation) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [user_id, title || null, department || null, experience || null, mobile || null, hospital_affiliation || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Doctor added successfully!', doctor_id: result.insertId });
  });
});

// PUT /doctors/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, department, experience, mobile, hospital_affiliation } = req.body;
  
  // Build dynamic UPDATE query based on provided fields
  const updateFields = [];
  const updateValues = [];
  
  if (title !== undefined) {
    updateFields.push('title = ?');
    updateValues.push(title || null);
  }
  if (department !== undefined) {
    updateFields.push('department = ?');
    updateValues.push(department || null);
  }
  if (experience !== undefined) {
    updateFields.push('experience = ?');
    updateValues.push(experience != null ? experience : null);
  }
  if (mobile !== undefined) {
    updateFields.push('mobile = ?');
    updateValues.push(mobile || null);
  }
  if (hospital_affiliation !== undefined) {
    updateFields.push('hospital_affiliation = ?');
    updateValues.push(hospital_affiliation || null);
  }
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'At least one field must be provided for update' });
  }
  
  updateValues.push(id);
  const sql = `UPDATE doctors SET ${updateFields.join(', ')} WHERE doctor_id = ?`;
  
  db.query(sql, updateValues, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Doctor not found.' });
    res.json({ message: 'Doctor updated successfully!' });
  });
});

// DELETE /doctors/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM doctors WHERE doctor_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Doctor deleted successfully!' });
  });
});

// POST /profile - Save or update a doctor's profile (by user_id)
// Updates the doctors table directly (no separate doctorprofiles table)
router.post('/profile', (req, res) => {
  try {
    const {
      user_id,
      full_name,
      phone, // maps to mobile in doctors table
      years_experience, // maps to experience in doctors table
      title,
      department, // maps to department in doctors table
      hospital_affiliation, // maps to hospital_affiliation in doctors table
      // Note: pricing_type, custom_price, services, specializations are not in doctors table
      // These fields will be ignored if sent
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required' });
    }

    // First, check if doctor record exists for this user_id
    const findDoctorSql = 'SELECT doctor_id FROM doctors WHERE user_id = ? LIMIT 1';
    db.query(findDoctorSql, [user_id], (findErr, doctorRows) => {
      if (findErr) {
        console.error('DB error (find doctor):', findErr);
        return res.status(500).json({ message: 'Server error' });
      }

      // Update full_name in users table if provided
      const updateUserName = (cb) => {
        if (!full_name) return cb(null);
        db.query('UPDATE users SET full_name = ? WHERE user_id = ?', [full_name, user_id], (uErr) => cb(uErr));
      };

      // Prepare update values for doctors table
      const updateFields = [];
      const updateValues = [];

      if (phone !== undefined) {
        updateFields.push('mobile = ?');
        updateValues.push(phone || null);
      }
      if (years_experience !== undefined) {
        updateFields.push('experience = ?');
        updateValues.push(years_experience != null ? years_experience : null);
      }
      if (title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(title || null);
      }
      if (department !== undefined) {
        updateFields.push('department = ?');
        updateValues.push(department || null);
      }
      if (hospital_affiliation !== undefined) {
        updateFields.push('hospital_affiliation = ?');
        updateValues.push(hospital_affiliation || null);
      }

      // If doctor exists, update it
      if (doctorRows && doctorRows.length > 0) {
        updateUserName((nameErr) => {
          if (nameErr) {
            console.error('DB error (update user full_name):', nameErr);
            return res.status(500).json({ message: 'Failed to update user name' });
          }

          if (updateFields.length === 0) {
            // No fields to update in doctors table, but user name might have been updated
            return res.json({ message: 'Doctor profile updated successfully' });
          }

          updateValues.push(user_id);
          const updateSql = `UPDATE doctors SET ${updateFields.join(', ')} WHERE user_id = ?`;
          
          db.query(updateSql, updateValues, (updErr) => {
            if (updErr) {
              console.error('DB error (update doctor profile):', updErr);
              return res.status(500).json({ message: 'Failed to update doctor profile' });
            }
            return res.json({ message: 'Doctor profile updated successfully' });
          });
        });
      } else {
        // Doctor doesn't exist, create new record
        updateUserName((nameErr) => {
          if (nameErr) {
            console.error('DB error (update user full_name):', nameErr);
            return res.status(500).json({ message: 'Failed to update user name' });
          }

          const insertFields = ['user_id'];
          const insertValues = [user_id];

          if (phone !== undefined) {
            insertFields.push('mobile');
            insertValues.push(phone || null);
          }
          if (years_experience !== undefined) {
            insertFields.push('experience');
            insertValues.push(years_experience != null ? years_experience : null);
          }
          if (title !== undefined) {
            insertFields.push('title');
            insertValues.push(title || null);
          }
          if (department !== undefined) {
            insertFields.push('department');
            insertValues.push(department || null);
          }
          if (hospital_affiliation !== undefined) {
            insertFields.push('hospital_affiliation');
            insertValues.push(hospital_affiliation || null);
          }

          const placeholders = insertFields.map(() => '?').join(', ');
          const insertSql = `INSERT INTO doctors (${insertFields.join(', ')}) VALUES (${placeholders})`;
          
          db.query(insertSql, insertValues, (insErr, result) => {
            if (insErr) {
              console.error('DB error (insert doctor profile):', insErr);
              return res.status(500).json({ message: 'Failed to save doctor profile' });
            }
            return res.status(201).json({ 
              message: 'Doctor profile created successfully', 
              doctor_id: result.insertId 
            });
          });
        });
      }
    });
  } catch (e) {
    console.error('Doctor profile save error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


