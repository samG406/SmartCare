const express = require("express");
const router = express.Router();
const db = require("../app/models");
const Appointment = db.appointments; // ✅ Correct model name

// ✅ GET all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    res.json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err.message);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// ✅ Accept appointment
router.post("/:id/accept", async (req, res) => {
  try {
    const { id } = req.params;
    await Appointment.update({ status: "accepted" }, { where: { appointment_id: id } }); // ✅ Fix column name
    res.json({ message: "Appointment accepted" });
  } catch (err) {
    console.error("Error accepting appointment:", err.message);
    res.status(500).json({ error: "Failed to accept appointment" });
  }
});

// ✅ Cancel appointment
router.post("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    await Appointment.update({ status: "cancelled" }, { where: { appointment_id: id } }); // ✅ Fix column name
    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    console.error("Error cancelling appointment:", err.message);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

// ✅ Get appointment stats (accepted, pending, cancelled)
router.get("/stats", async (req, res) => {
  try {
    const counts = await Appointment.findAll({
      attributes: [
        "status",
        [db.Sequelize.fn("COUNT", db.Sequelize.col("status")), "count"]
      ],
      group: ["status"]
    });

    const stats = {
      accepted: 0,
      pending: 0,
      cancelled: 0
    };

    counts.forEach((entry) => {
      const status = entry.status;
      const count = parseInt(entry.dataValues.count);
      if (stats.hasOwnProperty(status)) {
        stats[status] = count;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error("Stats route error:", error.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
