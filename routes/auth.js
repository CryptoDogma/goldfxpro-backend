const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const db = require("../utils/fileDb");
const { JWT_SECRET } = require("../config");
const {
  sendVerificationEmail,
  sendLicenseEmail
} = require("../services/emailService");

const router = express.Router();

/**
 * REGISTER
 * Creates a pending user and sends email verification
 */
router.post("/register", async (req, res) => {
  const { name, email, password, activationCode } = req.body;

  if (!name || !email || !password || !activationCode) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const users = db.read("users.json");
  const keys = db.read("activationKeys.json");

  // Validate activation key
  const key = keys.find(k => k.code === activationCode && !k.used);
  if (!key) {
    return res.status(400).json({ error: "Invalid or used activation key" });
  }

  // Prevent duplicate email
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = uuidv4();

  users.push({
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    verified: false,
    verificationToken,
    license: null,
    createdAt: new Date().toISOString()
  });

  db.write("users.json", users);

  await sendVerificationEmail(email, verificationToken);

  res.json({
    success: true,
    message: "Verification email sent. Please check your inbox."
  });
});

/**
 * EMAIL VERIFICATION
 * Activates user, generates license, emails license
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

  // Mark user as verified
  user.verified = true;
  user.verificationToken = null;

  // Generate license
  const license = "GFXP-" + uuidv4().slice(0, 8).toUpperCase();
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
    <p>Your account has been successfully activated.</p>
    <p>Your license key has been sent to your email.</p>
    <p>You may now close this window and log in.</p>
  `);
});

/**
 * LOGIN
 * Allows access only if email is verified
 */
router.post("/login", async (req, res) => {
  const { email, password, license } = req.body;

  if (!email || !password || !license) {
    return res.sendStatus(401);
  }

  const users = db.read("users.json");
  const user = users.find(u => u.email === email);

  if (!user) return res.sendStatus(401);

  if (!user.verified) {
    return res.status(403).json({ error: "Email not verified" });
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
