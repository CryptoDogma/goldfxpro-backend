const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { write, read } = require("../utils/fileDb");
const { sendActivationEmail } = require("../services/emailService");

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
  try {
    const { strategy } = req.body;

    if (!["v1", "v2"].includes(strategy)) {
      return res.status(400).json({ error: "Invalid strategy" });
    }

    // Read config safely
    let config = db.read("config.json");

    // Auto-create if missing or invalid
    if (!config || typeof config !== "object") {
      config = { activeStrategy: "v1" };
    }

    config.activeStrategy = strategy;
    db.write("config.json", config);

    res.json({
      success: true,
      activeStrategy: strategy
    });

  } catch (err) {
    console.error("Set strategy error:", err);
    res.status(500).json({ error: "Failed to update strategy" });
  }
});

module.exports = router;




