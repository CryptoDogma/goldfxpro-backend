const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { write, read } = require("../utils/fileDb");

const router = express.Router();

// Serve admin panel UI
router.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "views", "admin.html")
  );
});

// Generate activation key (protected)
router.post("/generate-activation", (req, res) => {
  const adminSecret = req.headers["x-admin-secret"];

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.sendStatus(403);
  }

  const keys = read("activationKeys.json");

  const code = "FX-ACT-" + uuidv4().slice(0, 6).toUpperCase();

  const key = {
    code,
    used: false,
    createdAt: new Date().toISOString()
  };

  keys.push(key);
  write("activationKeys.json", keys);

  res.json(key);
});

module.exports = router;
