const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const db = require('../config/db.auth');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
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

    console.log("Looking up doctor for user_id:", user.user_id);
    // If doctor, fetch title and department
    if (user.role.toLowerCase() === "doctor") {
      db.query(
        "SELECT doctor_id, title, department FROM Doctors WHERE user_id = ?",
        [user.user_id],
        (err, doctorRows) => {
          console.log("Doctor query result:", doctorRows);
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error" });
          }
          const doctor = doctorRows[0] || {};
          res.json({
            token,
            user: {
              user_id: user.user_id,
              email: user.email,
              role: user.role,
              doctor_id: doctor.doctor_id || null,
              title: doctor.title || "No title",
              department: doctor.department || "No department",
              full_name: user.full_name || user.name || ""
            }
          });
        }
      );
    } else {
      // Not a doctor, just return user info
      res.json({
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
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
    const query = 'INSERT INTO Users (full_name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(
      query,
      [full_name, email, hashedPassword, role],
      (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: "Error creating user" });
        }

        const userId = results.insertId;

        // If doctor, insert into Doctors table as well
        if (role.toLowerCase() === "doctor") {
          const doctorInsertQuery = 'INSERT INTO Doctors (user_id, title, department, experience, mobile, hospital_affiliation) VALUES (?, ?, ?, ?, ?, ?)';
          db.query(
            doctorInsertQuery,
            [userId, title || null, department || null, experience || null, mobile || null, hospital_affiliation || null],
            (err2, drResult) => {
              if (err2) {
                console.error('Doctor table insert error:', err2);
                return res.status(500).json({ message: "Error creating doctor profile" });
              }
              // Success response for doctor
              res.status(201).json({
                message: "User registered successfully",
                user: {
                  id: userId,
                  full_name,
                  email,
                  role,
                  title,
                  department,
                  mobile,
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
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;