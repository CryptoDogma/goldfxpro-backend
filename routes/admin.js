const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { write, read } = require("../utils/fileDb");
const { sendActivationEmail } = require("../services/emailService");
const db = require("../utils/fileDb");
const {
  setActiveStrategy
} = require("../services/strategyConfig");
const adminAuth = require("../middleware/adminAuth");
const { sendWhatsApp } = require("../services/whatsappService");

const router = express.Router();

// Serve admin panel UI
router.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "views", "admin.html")
  );
});

// Generate activation key (protected)
router.post("/generate-activation", async (req, res) => {
  const adminSecret = req.headers["x-admin-secret"];
  const { email } = req.body;

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.sendStatus(403);
  }

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  const keys = read("activationKeys.json");

  const code = "FX-ACT-" + uuidv4().slice(0, 6).toUpperCase();

  const key = {
    code,
    used: false,
    email,
    createdAt: new Date().toISOString()
  };

  keys.push(key);
  write("activationKeys.json", keys);

  await sendActivationEmail(email, code);

  res.json({
    success: true,
    message: "Activation key generated and emailed"
  });
});

//clear user account email address
router.post("/reset-user", (req, res) => {
  const adminSecret = req.headers["x-admin-secret"];
  const { email } = req.body;

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.sendStatus(403);
  }

  const users = read("users.json");
  const licenses = read("licenses.json");

  const newUsers = users.filter(u => u.email !== email);
  const newLicenses = licenses.filter(l => l.email !== email);

  write("users.json", newUsers);
  write("licenses.json", newLicenses);

  res.json({ success: true, message: "User removed" });
});
//Change stratagy
router.post("/set-strategy", (req, res) => {
  const { strategy } = req.body;
  const allowed = ["v1", "v2", "v3"];

  if (!allowed.includes(strategy)) {
    return res.status(400).json({ error: "Invalid strategy" });
  }

  const active = setActiveStrategy(strategy);

  res.json({
    success: true,
    activeStrategy: active
  });
});
/**
 * Update user WhatsApp settings
 * Admin-only
 */
router.post("/update-user", adminAuth, async (req, res) => {
  try {
    const { email, phone, whatsappOptIn } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const users = db.read("users.json");

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields safely
    if (phone) {
      user.phone = phone;
    }

    if (typeof whatsappOptIn === "boolean") {
      user.whatsappOptIn = whatsappOptIn;
    }

    db.write("users.json", users);

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        email: user.email,
        phone: user.phone,
        whatsappOptIn: user.whatsappOptIn
      }
    });
  } catch (err) {
    console.error("Admin update-user error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

module.exports = router;




















