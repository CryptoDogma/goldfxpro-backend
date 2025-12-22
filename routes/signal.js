const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * Temporary signal engine (Phase 1)
 * No live prices yet – structure only
 */
router.get("/signal", auth, (req, res) => {
  // Simulated EMA bias (placeholder logic)
  const bullish = Math.random() > 0.5;

  const signal = {
    pair: "XAUUSD",
    timeframe: "M15",
    direction: bullish ? "BUY" : "SELL",
    entry: "MARKET",
    takeProfit: bullish ? "+200 pips" : "+200 pips",
    stopLoss: bullish ? "-100 pips" : "-100 pips",
    confidence: bullish ? 0.68 : 0.62,
    reasoning: bullish
      ? "EMA 50 above EMA 200 (bullish trend)"
      : "EMA 50 below EMA 200 (bearish trend)",
    timestamp: new Date().toISOString()
  };

  res.json(signal);
});

module.exports = router;
