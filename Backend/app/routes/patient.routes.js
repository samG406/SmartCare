const express = require("express");
const router = express.Router();
const db = require("../models");
const Patient = db.patient;

// GET /api/patients - fetch all patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch patients", error: error.message });
  }
});

// POST /api/patients - create a new patient (Optional for testing)
router.post("/", async (req, res) => {
  try {
    const newPatient = await Patient.create(req.body);
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(500).json({ message: "Failed to create patient", error: error.message });
  }
});

module.exports = router;
