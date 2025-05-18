const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const appointmentController = require("../controllers/appointment.controller");

// ✅ Public route - optional
router.get("/status", (req, res) => {
  res.send("✅ Appointment route is working");
});

// ✅ Protected route - Get all appointments
router.get("/", verifyToken, appointmentController.getAllAppointments);

// ✅ Protected route - Create new appointment
router.post("/", verifyToken, appointmentController.createAppointment);

// You can add more routes: update, delete, etc.

module.exports = router;
