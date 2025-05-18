const express = require('express');
const router = express.Router();
const db = require('../app/models');
const Patients = db.patients; // ✅ Corrected here (patients with s)

// Get All Patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patients.findAll();
    res.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ message: "Error fetching patients" });
  }
});

module.exports = router;
