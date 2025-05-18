const db = require("../models");
const User = db.user;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// 🔐 Signup Controller
exports.signup = async (req, res) => {
  console.log("📥 [SIGNUP] Incoming request body:", req.body);

  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    console.log("❌ Missing field(s):", { name, email, password, role });
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    console.log("✅ [SIGNUP] User successfully created:", user.email);
    return res.status(201).json({ message: "User registered", user });
  } catch (err) {
    console.error("🔥 [SIGNUP] Error:", err.message);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

// 🔓 Login Controller
exports.login = async (req, res) => {
  console.log("📥 [LOGIN] Incoming request body:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log("❌ [LOGIN] User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      console.log("❌ [LOGIN] Invalid password");
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user.user_id }, "smarthealth-secret", {
      expiresIn: 86400, // 24 hours
    });

    console.log("✅ [LOGIN] Successful login:", email);
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("🔥 [LOGIN] Error:", err.message);
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
};
