/**
 * signal.js
 * Phase C + Analysis: Live price + session + EMA bias + signal analysis
 */

const express = require("express");
const auth = require("../middleware/auth");

const { getGoldPrice, getGoldCandles } = require("../services/priceService");
const { getSessionInfo } = require("../services/sessionService");
const { calculateEMA } = require("../services/emaService");
const { buildAnalysis } = require("../services/analysisService");
const db = require("../utils/fileDb");

const router = express.Router();

router.get("/signal", auth, async (req, res) => {
  try {
    // 1️⃣ Live price
    const price = await getGoldPrice();

    // 2️⃣ Candle closes (oldest → newest)
    const prices = await getGoldCandles();

    if (!prices || prices.length < 200) {
      throw new Error("Not enough candle data");
    }

    // 3️⃣ EMA calculations
    const ema50 = calculateEMA(prices.slice(-50), 50);
    const ema200 = calculateEMA(prices.slice(-200), 200);

    const bullish = ema50 > ema200;

    // 4️⃣ Count bars since last EMA cross (trend age)
    let biasBars = 0;
    for (let i = prices.length - 1; i >= 200; i--) {
      const e50 = calculateEMA(prices.slice(i - 50, i), 50);
      const e200 = calculateEMA(prices.slice(i - 200, i), 200);

      if ((bullish && e50 > e200) || (!bullish && e50 < e200)) {
        biasBars++;
      } else {
        break;
      }
    }

    // 5️⃣ Simple volatility proxy (ATR-like %)
    const recent = prices.slice(-20);
    const high = Math.max(...recent);
    const low = Math.min(...recent);
    const atrPct = (high - low) / price;

    // 6️⃣ Session logic
    const session = getSessionInfo();

    // 7️⃣ Risk model (fixed R:R)
    const stopLoss = bullish ? price - 10 : price + 10;
    const takeProfit = bullish ? price + 20 : price - 20;

    let confidence = bullish ? 0.70 : 0.65;
    if (session.volatility === "Low") confidence -= 0.15;

    // 8️⃣ Build analysis object
    const analysis = buildAnalysis({
      emaFast: ema50,
      emaSlow: ema200,
      price,
      biasBars,
      atrPct
    });
    // --- Save signal history (keep last 20) ---
const signals = db.read("signals.json");

signals.unshift({
  pair: "XAUUSD",
  timeframe: "M15",
  direction: bullish ? "BUY" : "SELL",
  entry: price.toFixed(2),
  stopLoss: stopLoss.toFixed(2),
  takeProfit: takeProfit.toFixed(2),
  session: session.session,
  confidence: Number(confidence.toFixed(2)),
  quality: {
    grade: analysis.qualityGrade,
    score: analysis.qualityScore
  },
  timestamp: new Date().toISOString()
});

// keep only latest 20
db.write("signals.json", signals.slice(0, 20));

    // 9️⃣ Response
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
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("Signal error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

