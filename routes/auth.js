const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../utils/fileDb");
const { JWT_SECRET } = require("../config");
const {
  sendLicenseEmail
} = require("../services/emailService");

const router = express.Router();

/**
 * EMAIL VERIFICATION
 * (legacy users only – optional)
 */
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Invalid verification link");
  }

  const users = db.read("users.json");
  const licenses = db.read("licenses.json");

  const user = users.find(u => u.verificationToken === token);

  if (!user) {
    return res.status(400).send("Invalid or expired verification link");
  }

  user.verified = true;
  user.verificationToken = null;

  const license = "GFXP-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  user.license = license;

  licenses.push({
    email: user.email,
    license,
    createdAt: new Date().toISOString()
  });

  db.write("users.json", users);
  db.write("licenses.json", licenses);

  await sendLicenseEmail(user.email, license);

  res.send(`
    <h2>Email Verified</h2>
    <p>Your account has been activated.</p>
    <p>Your license key has been emailed to you.</p>
    <p>You may now log in.</p>
  `);
});

/**
 * LOGIN
 */
router.post("/login", async (req, res) => {
  const { email, password, license } = req.body;

  if (!email || !password || !license) {
    return res.sendStatus(401);
  }

  const users = db.read("users.json");
  const user = users.find(u => u.email === email);

  if (!user) return res.sendStatus(401);

  if (user.verified === false) {
    return res.status(403).json({ error: "Account not verified" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid || user.license !== license) {
    return res.sendStatus(401);
  }

  const token = jwt.sign(
    { email: user.email },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token });
});

module.exports = router;
