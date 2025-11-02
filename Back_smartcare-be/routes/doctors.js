const express = require('express');
const router = express.Router();
const db = require('../config/db.auth');

// GET /doctors
router.get('/', (req, res) => {
  db.query(
    `SELECT d.*, u.full_name 
     FROM Doctors d 
     LEFT JOIN Users u ON d.user_id = u.user_id`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// POST /doctors
router.post('/', (req, res) => {
  const { name, specialization, email, phone } = req.body;
  const sql = 'INSERT INTO Doctors (name, specialization, email, phone) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, specialization, email, phone], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Doctor added successfully!', doctor_id: result.insertId });
  });
});

// PUT /doctors/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, specialization, email, phone } = req.body;
  const sql = 'UPDATE Doctors SET name = ?, specialization = ?, email = ?, phone = ? WHERE doctor_id = ?';
  const values = [name, specialization, email, phone, id];
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Doctor not found.' });
    res.json({ message: 'Doctor updated successfully!' });
  });
});

// DELETE /doctors/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM Doctors WHERE doctor_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Doctor deleted successfully!' });
  });
});

// POST /profile - Save or update a doctor's profile (by user_id)
router.post('/profile', (req, res) => {
  try {
    const {
      user_id,
      full_name,
      phone,
      years_experience,
      pricing_type,
      custom_price,
      services,
      specializations,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required' });
    }

    const createTableSql = `CREATE TABLE IF NOT EXISTS DoctorProfiles (
      doctor_profile_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNIQUE,
      phone VARCHAR(50) NULL,
      years_experience INT NULL,
      pricing_type ENUM('free','custom') NULL,
      custom_price DECIMAL(10,2) NULL,
      services JSON NULL,
      specializations JSON NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`;

    db.query(createTableSql, (tblErr) => {
      if (tblErr) {
        console.error('DB error (create DoctorProfiles):', tblErr);
        return res.status(500).json({ message: 'Server error' });
      }

      const findSql = 'SELECT doctor_profile_id FROM DoctorProfiles WHERE user_id = ? LIMIT 1';
      db.query(findSql, [user_id], (findErr, rows) => {
        if (findErr) {
          console.error('DB error (find doctor profile):', findErr);
          return res.status(500).json({ message: 'Server error' });
        }

        const servicesJson = services ? JSON.stringify(services) : null;
        const specsJson = specializations ? JSON.stringify(specializations) : null;

        // If a new full_name is provided, update it on Users table (source of truth)
        const updateUserName = (cb) => {
          if (!full_name) return cb();
          db.query('UPDATE Users SET full_name = ? WHERE user_id = ?', [full_name, user_id], (uErr) => cb(uErr));
        };

        if (rows && rows.length > 0) {
          updateUserName((nameErr) => {
            if (nameErr) {
              console.error('DB error (update user full_name):', nameErr);
              return res.status(500).json({ message: 'Failed to update user name' });
            }
          const updateSql = `UPDATE DoctorProfiles SET
            phone = ?,
            years_experience = ?,
            pricing_type = ?,
            custom_price = ?,
            services = ?,
            specializations = ?
          WHERE user_id = ?`;
          const updateValues = [
            phone || null,
            years_experience != null ? years_experience : null,
            pricing_type || null,
            custom_price != null ? custom_price : null,
            servicesJson,
            specsJson,
            user_id,
          ];
          db.query(updateSql, updateValues, (updErr) => {
            if (updErr) {
              console.error('DB error (update doctor profile):', updErr);
              return res.status(500).json({ message: 'Failed to update doctor profile' });
            }
            return res.json({ message: 'Doctor profile updated successfully' });
          });
          });
        } else {
          updateUserName((nameErr) => {
            if (nameErr) {
              console.error('DB error (update user full_name):', nameErr);
              return res.status(500).json({ message: 'Failed to update user name' });
            }
          const insertSql = `INSERT INTO DoctorProfiles
            (user_id, phone, years_experience, pricing_type, custom_price, services, specializations)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
          const insertValues = [
            user_id,
            phone || null,
            years_experience != null ? years_experience : null,
            pricing_type || null,
            custom_price != null ? custom_price : null,
            servicesJson,
            specsJson,
          ];
          db.query(insertSql, insertValues, (insErr, result) => {
            if (insErr) {
              console.error('DB error (insert doctor profile):', insErr);
              return res.status(500).json({ message: 'Failed to save doctor profile' });
            }
            return res.status(201).json({ message: 'Doctor profile created successfully', doctor_profile_id: result.insertId });
          });
          });
        }
      });
    });
  } catch (e) {
    console.error('Doctor profile save error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


