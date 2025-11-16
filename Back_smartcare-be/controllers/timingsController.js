const db = require('../config/db.auth');

// GET /api/timings/:doctorId
// Returns schedule timings grouped by weekday for a doctor
exports.getTimingsForDoctor = (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({ error: 'Doctor ID is required' });
    }

    const sql = `
      SELECT weekday, start_time, end_time
      FROM scheduletimings
      WHERE doctor_id = ?
      ORDER BY weekday, start_time
    `;

    db.query(sql, [doctorId], (err, results) => {
      if (err) {
        console.error('Database error fetching timings:', err.message || err.sqlMessage);
        
        if (!res.headersSent) {
          return res.status(500).json({ 
            error: 'Failed to fetch schedule timings',
            details: err.message || err.sqlMessage || 'Unknown database error'
          });
        }
        return;
      }

      // Group by weekday
      const grouped = {};
      if (results && Array.isArray(results)) {
        results.forEach(row => {
          if (!grouped[row.weekday]) {
            grouped[row.weekday] = [];
          }
          grouped[row.weekday].push({
            start: row.start_time,
            end: row.end_time
          });
        });
      }

      res.json(grouped);
    });
  } catch (error) {
    console.error('Exception in getTimingsForDoctor:', error);
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message
      });
    }
  }
};

// POST /api/timings
// Saves or updates schedule timings for a doctor
// Body: { doctor_id, weekday, intervals: [{start, end}] }
exports.saveTimings = (req, res) => {
  const { doctor_id, weekday, intervals } = req.body;

  if (!doctor_id || !weekday) {
    return res.status(400).json({ error: 'doctor_id and weekday are required' });
  }

  // Delete existing timings for this doctor and weekday
  const deleteSql = 'DELETE FROM scheduletimings WHERE doctor_id = ? AND weekday = ?';
  
  db.query(deleteSql, [doctor_id, weekday], (deleteErr) => {
    if (deleteErr) {
      console.error('Error deleting old timings:', deleteErr);
      return res.status(500).json({ error: 'Failed to update schedule timings' });
    }

    // If no intervals provided, just delete and return success
    if (!intervals || intervals.length === 0) {
      return res.json({ message: 'Schedule timings updated successfully', weekday, intervals: [] });
    }

    // Insert new timings
    const insertSql = 'INSERT INTO scheduletimings (doctor_id, weekday, start_time, end_time) VALUES ?';
    const values = intervals.map(interval => [doctor_id, weekday, interval.start, interval.end]);

    db.query(insertSql, [values], (insertErr) => {
      if (insertErr) {
        console.error('Error inserting timings:', insertErr);
        return res.status(500).json({ error: 'Failed to save schedule timings' });
      }

      res.json({ 
        message: 'Schedule timings saved successfully', 
        weekday, 
        intervals 
      });
    });
  });
};

