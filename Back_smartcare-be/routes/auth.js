const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const db = require('../config/db.auth');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }


    // Find user by email
    let user;
    try {
      user = await User.findByEmail(email);
    } catch (dbError) {
      console.error('Database error finding user:', dbError);
      if (!res.headersSent) {
        return res.status(500).json({ 
          message: "Database error",
          error: dbError.message || 'Unknown database error'
        });
      }
      return;
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }


    // Check if password field exists
    if (!user.password) {
      console.error('User has no password field:', user);
      return res.status(500).json({ 
        message: "User account error",
        error: "Password field missing" 
      });
    }

    // Verify password
    let isValidPassword;
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('Bcrypt error:', bcryptError);
      if (!res.headersSent) {
        return res.status(500).json({ 
          message: "Password verification error",
          error: bcryptError.message || 'Unknown password error'
        });
      }
      return;
    }

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id,
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // If doctor, fetch doctor details
    const userRole = (user.role || '').toLowerCase();
    if (userRole === "doctor") {
      // Convert callback-based query to promise
      // Use SELECT * to tolerate schema differences (department vs specialization, mobile vs phone_number).
      let doctorRows = [];
      try {
        doctorRows = await new Promise((resolve, reject) => {
          db.query(
            "SELECT * FROM doctors WHERE user_id = ?",
            [user.user_id],
            (err, results) => {
              if (err) {
                console.error("Doctor query error:", err);
                console.error("Error details:", err.message, err.code, err.sqlMessage);
                // Don't reject - just return empty array if query fails
                // This allows login to succeed even if Doctors table has issues
                console.warn("Warning: Could not fetch doctor details, continuing with basic user info");
                return resolve([]);
              }
              resolve(results || []);
            }
          );
        });
      } catch (doctorError) {
        console.error("Error in doctor query promise:", doctorError);
        // Continue with empty doctor data
        doctorRows = [];
      }
      
      const doctor = doctorRows[0] || {};
      const department = doctor.department || doctor.specialization || null;
      const mobile = doctor.mobile || doctor.phone_number || null;
      return res.json({
        token,
        user: {
          user_id: user.user_id,
          email: user.email,
          role: user.role,
          doctor_id: doctor.doctor_id || null,
          department,
          specialization: doctor.specialization || department,
          mobile,
          phone_number: doctor.phone_number || mobile,
          hospital_affiliation: doctor.hospital_affiliation || null,
          experience: doctor.experience || null,
          full_name: user.full_name || user.name || ""
        }
      });
    } else {
      // Not a doctor, just return user info
      return res.json({
        token,
        user: {
          user_id: user.user_id,
          email: user.email,
          role: user.role,
          full_name: user.full_name || user.name || ""
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Ensure response hasn't been sent already
    if (!res.headersSent) {
      // Return detailed error in development, generic in production
      const isDevelopment = process.env.NODE_ENV !== 'production';
      res.status(500).json({ 
        message: "Server error",
        ...(isDevelopment && { 
          error: error.message || 'Unknown error',
          stack: error.stack 
        })
      });
    } else {
      console.error('Response already sent, cannot send error response');
    }
  }
});



// Add Signup route
router.post('/signup', async (req, res) => {
  try {
    // Accept doctor-specific fields as well
    const { full_name, email, password, role, title, department, experience, mobile, hospital_affiliation } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const query = 'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(
      query,
      [full_name, email, hashedPassword, role],
      (error, results) => {
        if (error) {
          console.error('User insert error:', error);
          console.error('Error details:', error.message, error.code, error.sqlMessage);
          if (!res.headersSent) {
            return res.status(500).json({ 
              message: "Error creating user", 
              error: error.message || 'Unknown database error'
            });
          }
          return;
        }

        const userId = results.insertId;

        // If doctor, insert into Doctors table as well
        // Use department/mobile to match schema in routes/doctors.js and README.
        const userRole = (role || '').toLowerCase();
        if (userRole === "doctor") {
          const doctorInsertQuery = 'INSERT INTO doctors (user_id, department, mobile, experience, hospital_affiliation) VALUES (?, ?, ?, ?, ?)';
          db.query(
            doctorInsertQuery,
            [userId, department || null, mobile || null, experience || null, hospital_affiliation || null],
            (err2, drResult) => {
              if (err2) {
                console.error('Doctor table insert error:', err2);
                console.error('Error details:', err2.message, err2.code, err2.sqlMessage);
                if (!res.headersSent) {
                  return res.status(500).json({ 
                    message: "Error creating doctor profile", 
                    error: err2.message || 'Unknown database error'
                  });
                }
                return;
              }
              // Success response for doctor
              res.status(201).json({
                message: "User registered successfully",
                user: {
                  id: userId,
                  full_name,
                  email,
                  role,
                  specialization: department || null,
                  phone_number: mobile || null,
                  experience: experience || null,
                  hospital_affiliation: hospital_affiliation || null,
                  doctor_id: drResult?.insertId || null
                }
              });
            }
          );
        } else {
          // Success response for non-doctor
          res.status(201).json({
            message: "User registered successfully",
            user: {
              id: userId,
              full_name,
              email,
              role
            }
          });
        }
      }
    );

  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Ensure response hasn't been sent already
    if (!res.headersSent) {
      // Return detailed error in development, generic in production
      const isDevelopment = process.env.NODE_ENV !== 'production';
      res.status(500).json({ 
        message: "Server error",
        ...(isDevelopment && { 
          error: error.message || 'Unknown error',
          stack: error.stack 
        })
      });
    } else {
      console.error('Response already sent, cannot send error response');
    }
  }
});

module.exports = router;