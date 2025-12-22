/**
 * signal.js
 * JWT-protected signal endpoint
 * Uses real XAUUSD price
 */

const express = require("express");
const auth = require("../middleware/auth");
const { getGoldPrice } = require("../services/priceService");

const router = express.Router();

router.get("/signal", auth, async (req, res) => {
  try {
    // Fetch live gold price
    const price = await getGoldPrice();

    // Temporary trend bias (will be replaced in Phase C)
    const bullish = Math.random() > 0.5;

    // Simple fixed-risk model (Gold ~$1 = 100 pips)
    const stopLoss = bullish ? price - 10 : price + 10;
    const takeProfit = bullish ? price + 20 : price - 20;

    res.json({
      pair: "XAUUSD",
      timeframe: "M15",
      direction: bullish ? "BUY" : "SELL",
      entry: price.toFixed(2),
      takeProfit: takeProfit.toFixed(2),
      stopLoss: stopLoss.toFixed(2),
      confidence: bullish ? 0.70 : 0.65,
      reasoning: "Live gold price with trend bias",
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("Signal error:", err.message);
    res.status(500).json({ error: "Signal generation failed" });
  }
});

module.exports = router;
