/**
 * signal.js
 * GOLD FX PRO – Signal Read API
 * Dashboard-only endpoint (read precomputed signal)
 */

const express = require("express");
const auth = require("../middleware/auth");
const db = require("../utils/fileDb");

const router = express.Router();

/**
 * GET /api/signal
 * Returns the latest signal computed by the scheduler
 */
router.get("/signal", auth, (req, res) => {
  try {
    const signal = db.read("currentSignal.json");

    if (!signal || Object.keys(signal).length === 0) {
      return res.json({
        status: "WAIT",
        reason: "No signal computed yet",
        timestamp: new Date().toISOString()
      });
    }

    res.json(signal);
  } catch (err) {
    console.error("Signal read error:", err.message);
    res.status(500).json({ error: "Signal unavailable" });
  }
});

module.exports = router;
