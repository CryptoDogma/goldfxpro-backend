const express = require("express");
const auth = require("../middleware/auth");
const db = require("../utils/fileDb");

const router = express.Router();

/**
 * GET /api/signal
 * Read-only current signal (scheduler-owned)
 */
router.get("/signal", auth, (req, res) => {
  let signal;

  try {
    signal = db.read("currentSignal.json");
  } catch {
    signal = null;
  }

  // Prevent client caching
  res.setHeader("Cache-Control", "no-store");

  if (!signal || Object.keys(signal).length === 0) {
    return res.json({
      status: "WAIT",
      reason: "No signal generated yet",
      timestamp: new Date().toISOString()
    });
  }

  res.json(signal);
});

module.exports = router;
