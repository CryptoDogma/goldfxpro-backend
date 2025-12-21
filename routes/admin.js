const express = require("express");
const db = require("../utils/fileDb");
const { generateActivationKey } = require("../utils/keygen");
const { ADMIN_SECRET } = require("../config");

const router = express.Router();

// Admin guard
router.use((req, res, next) => {
  if (req.headers["x-admin-secret"] !== ADMIN_SECRET) {
    return res.sendStatus(403);
  }
  next();
});

router.post("/generate-activation", (req, res) => {
  const keys = db.read("activationKeys.json");

  const key = {
    code: generateActivationKey(),
    used: false,
    createdAt: new Date().toISOString()
  };

  keys.push(key);
  db.write("activationKeys.json", keys);

  res.json(key);
});

module.exports = router;
