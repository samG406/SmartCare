const express = require("express");
const cors = require("cors");
const db = require("./app/models");

const authRoutes = require("./app/routes/auth.routes");
console.log("✅ Using AUTH routes from: ./app/routes/auth.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const patientRoutes = require("./routes/patient.routes");
const doctorRoutes = require("./routes/doctor.routes");

const app = express();
const PORT = process.env.PORT || 7070;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Request Logger
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// ✅ Temporary Direct Test POST Route
app.post("/api/test-direct", (req, res) => {
  console.log("✅ [POST] /api/test-direct hit with body:", req.body);
  res.status(200).json({ message: "✅ Direct POST route working", received: req.body });
});

// ✅ Main API Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);

// ✅ Root Test Route
app.get("/", (req, res) => {
  res.json({ message: "SmartHealthcare Sequelize API is running." });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ✅ Sync DB and Start Server
db.sequelize.sync()
  .then(() => {
    console.log("✅ Synced DB");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to sync DB:", err.message);
  });
