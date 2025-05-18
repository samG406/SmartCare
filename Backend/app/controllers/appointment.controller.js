const db = require("../models");
const Appointment = db.appointments;

// 🔍 Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    res.status(200).json(appointments);
  } catch (err) {
    console.error("🔥 [GET ALL] Error:", err.message);
    res.status(500).json({ message: "Failed to fetch appointments", error: err.message });
  }
};

// ➕ Create new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, reason, status } = req.body;

    if (!patient_id || !doctor_id || !appointment_date) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const newAppointment = await Appointment.create({
      patient_id,
      doctor_id,
      appointment_date,
      reason,
      status: status || "pending",
    });

    res.status(201).json({ message: "Appointment created", appointment: newAppointment });
  } catch (err) {
    console.error("🔥 [CREATE] Error:", err.message);
    res.status(500).json({ message: "Failed to create appointment", error: err.message });
  }
};
