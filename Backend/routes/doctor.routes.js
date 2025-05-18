const express = require("express");
const router = express.Router();
const db = require("../app/models");
const Doctors = db.doctors; // ✅ Correct model key

// GET all doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctors.findAll();
    res.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Error fetching doctors" });
  }
});

module.exports = router;
