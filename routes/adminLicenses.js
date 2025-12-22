const express = require("express");
const db = require("../utils/fileDb");

const router = express.Router();

// Middleware
function adminAuth(req, res, next) {
  if (req.headers["x-admin-secret"] !== process.env.ADMIN_SECRET) {
    return res.sendStatus(403);
  }
  next();
}

// GET all licenses
router.get("/licenses", adminAuth, (req, res) => {
  const licenses = db.read("licenses.json");
  res.json(licenses);
});

// EXTEND license
router.post("/licenses/extend", adminAuth, (req, res) => {
  const { email, days } = req.body;
  const licenses = db.read("licenses.json");

  const license = licenses.find(l => l.email === email);
  if (!license) return res.sendStatus(404);

  const date = new Date(license.expiresAt);
  date.setDate(date.getDate() + Number(days));
  license.expiresAt = date.toISOString();

  db.write("licenses.json", licenses);
  res.json({ success: true, expiresAt: license.expiresAt });
});

// TOGGLE active
router.post("/licenses/toggle", adminAuth, (req, res) => {
  const { email } = req.body;
  const licenses = db.read("licenses.json");

  const license = licenses.find(l => l.email === email);
  if (!license) return res.sendStatus(404);

  license.active = !license.active;
  db.write("licenses.json", licenses);

  res.json({ success: true, active: license.active });
});

module.exports = router;
