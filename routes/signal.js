const express = require("express");
const auth = require("../middleware/auth");
const db = require("../utils/fileDb");

const router = express.Router();

router.get("/signal", auth, (req, res) => {
  const signal = db.read("currentSignal.json");
  res.json(signal || { status: "WAIT" });
});

module.exports = router;
