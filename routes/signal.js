/**
 * signal.js
 * Phase B: Live price + session awareness
 */

const express = require("express");
const auth = require("../middleware/auth");
const { getGoldPrice } = require("../services/priceService");
const { getSessionInfo } = require("../services/sessionService");

const router = express.Router();

router.get("/signal", auth, async (req, res) => {
  try {
    const price = await getGoldPrice();
    const session = getSessionInfo();

    // Temporary trend bias (Phase C will replace this)
    const bullish = Math.random() > 0.5;

    // Risk model
    const stopLoss = bullish ? price - 10 : price + 10;
    const takeProfit = bullish ? price + 20 : price - 20;

    // Confidence adjustment based on session
    let confidence = bullish ? 0.70 : 0.65;
    if (session.volatility === "Low") {
      confidence -= 0.15;
    }

    res.json({
      pair: "XAUUSD",
      timeframe: "M15",
      direction: bullish ? "BUY" : "SELL",
      entry: price.toFixed(2),
      takeProfit: takeProfit.toFixed(2),
      stopLoss: stopLoss.toFixed(2),
      session: session.session,
      volatility: session.volatility,
      confidence: Number(confidence.toFixed(2)),
      reasoning:
        session.volatility === "High"
          ? "High-liquidity session with trend bias"
          : "Low-liquidity session, reduced confidence",
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("Signal error:", err.message);
    res.status(500).json({ error: "Signal generation failed" });
  }
});

module.exports = router;
