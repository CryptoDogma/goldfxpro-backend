const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../utils/fileDb");
const { generateLicenseKey } = require("../utils/keygen");

const router = express.Router();

/**
 * REGISTER USER + ACTIVATE LICENSE
 */
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      activationCode,
      phone,
      whatsappOptIn
    } = req.body;

    if (!name || !email || !password || !activationCode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1️⃣ Validate activation code
    const activationKeys = db.read("activationKeys.json");
    const code = activationKeys.find(
      k => k.code === activationCode && !k.used
    );

    if (!code) {
      return res.status(400).json({ error: "Invalid activation code" });
    }

    // 2️⃣ Ensure user does not exist
    const users = db.read("users.json");
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 3️⃣ Mark activation code as used
    code.used = true;
    code.usedAt = new Date().toISOString();
    db.write("activationKeys.json", activationKeys);

    // 4️⃣ Create user
    const passwordHash = await bcrypt.hash(password, 10);

    users.push({
      name,
      email,
      password: passwordHash,
      verified: true,
      phone: phone || null,
      whatsappOptIn: Boolean(whatsappOptIn),
      createdAt: new Date().toISOString()
    });

    db.write("users.json", users);

    // 5️⃣ Create license (30 days)
    const licenses = db.read("licenses.json");
    const licenseKey = generateLicenseKey();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    licenses.push({
      email,
      licenseKey,
      active: true,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    });

    db.write("licenses.json", licenses);

    // 6️⃣ Success
    res.json({
      success: true,
      message: "Registration successful",
      licenseKey,
      expiresAt: expiresAt.toISOString()
    });

  } catch (err) {
    console.error("License register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

module.exports = router;
