const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// ✅ Test GET route
router.get("/", (req, res) => {
  res.send("✅ Auth route is reachable!");
});

// ✅ Temporary POST test route
router.post("/signup-test", (req, res) => {
  console.log("✅ [TEST] /signup-test hit with body:", req.body);
  res.status(200).json({ message: "Signup test successful", body: req.body });
});

// Signup route
router.post("/signup", authController.signup);

// Login route
router.post("/login", authController.login);

module.exports = router;
