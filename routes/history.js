const express = require("express");
const auth = require("../middleware/auth");
const db = require("../utils/fileDb");

const router = express.Router();

router.get("/history", auth, (req, res) => {
  const signals = db.read("signals.json");
  res.json(signals || []);
});

module.exports = router;
