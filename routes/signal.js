/**
 * signal.js
 * Phase C: Live price + session + EMA bias
 */

const express = require("express");
const auth = require("../middleware/auth");

const { getGoldPrice, getGoldCandles } = require("../services/priceService");
const { getSessionInfo } = require("../services/sessionService");
const { calculateEMA } = require("../services/emaService");

const router = express.Router();

router.get("/signal", auth, async (req, res) => {
  try {
    // Fetch live price
    const price = await getGoldPrice();

    // Fetch candle closes
    const prices = await getGoldCandles();

    if (prices.length < 200) {
      throw new Error("Not enough candle data");
    }

    // EMA calculations
    const ema50 = calculateEMA(prices.slice(-50), 50);
    const ema200 = calculateEMA(prices.slice(-200), 200);

    const bullish = ema50 > ema200;

    // Session logic
    const session = getSessionInfo();

    // Risk model
    const stopLoss = bullish ? price - 10 : price + 10;
    const takeProfit = bullish ? price + 20 : price - 20;

    let confidence = bullish ? 0.70 : 0.65;
    if (session.volatility === "Low") confidence -= 0.15;

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
      reasoning: bullish
        ? "EMA 50 above EMA 200 (bullish trend)"
        : "EMA 50 below EMA 200 (bearish trend)",
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("Signal error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
