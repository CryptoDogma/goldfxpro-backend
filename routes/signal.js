/**
 * signal.js
 * GOLD FX PRO – Strategy Engine v1
 */

const express = require("express");
const auth = require("../middleware/auth");

const { getGoldPrice, getGoldCandles } = require("../services/priceService");
const { getSessionInfo } = require("../services/sessionService");
const { calculateEMA } = require("../services/emaService");
const { runStrategy } = require("../services/strategies");
const db = require("../utils/fileDb");

const router = express.Router();

router.get("/signal", auth, async (req, res) => {
  try {
    // 1️⃣ Live price
    const price = await getGoldPrice();

    // 2️⃣ Candle data (OHLC array expected)
    const candles = await getGoldCandles();

    if (!candles || candles.length < 200) {
      return res.status(500).json({ error: "Not enough candle data" });
    }

    // 3️⃣ EMA calculations (bias only)
    const closes = candles.map(c => c.close);
    const ema50 = calculateEMA(closes.slice(-50), 50);
    const ema200 = calculateEMA(closes.slice(-200), 200);

    // 4️⃣ Session & volatility
    const sessionInfo = getSessionInfo();

    // 5️⃣ Build analysis (THE BRAIN)
    const analysis = buildAnalysis({
      price,
      ema50,
      ema200,
      session: sessionInfo.session,
      volatility: sessionInfo.volatility,
      candles
    });

    // 🚫 NO TRADE OR WAIT → return explanation only
    if (analysis.status !== "TRADE") {
      return res.json({
        status: analysis.status,
        reason: analysis.reason,
        session: sessionInfo.session,
        volatility: sessionInfo.volatility,
        timestamp: new Date().toISOString()
      });
    }

    // 6️⃣ Trade parameters (fixed R:R, safe defaults)
    const direction = analysis.bias;
    const stopLoss =
      direction === "BUY" ? price - 10 : price + 10;
    const takeProfit =
      direction === "BUY" ? price + 20 : price - 20;

    // 7️⃣ Build signal object
    const signal = {
      pair: "XAUUSD",
      timeframe: "M15",
      direction,
      entry: price.toFixed(2),
      stopLoss: stopLoss.toFixed(2),
      takeProfit: takeProfit.toFixed(2),
      session: sessionInfo.session,
      volatility: sessionInfo.volatility,
      confidence: Number(analysis.confidence.toFixed(2)),
      analysis: {
        trendStrength: Math.abs(ema50 - ema200).toFixed(2),
        trendAge: "Active",
        volatility: sessionInfo.volatility,
        qualityGrade: analysis.quality.grade,
        qualityScore: analysis.quality.score
      },
      reasoning: `Bias: ${direction}, Pullback confirmed, ${sessionInfo.session} session`,
      timestamp: new Date().toISOString()
    };

    // 8️⃣ Save history (ONLY VALID TRADES)
    const history = db.read("signals.json");
    history.unshift(signal);
    db.write("signals.json", history.slice(0, 20));

    // 9️⃣ Respond
    res.json(signal);

  } catch (err) {
    console.error("Signal error:", err);
    res.status(500).json({ error: "Signal engine failure" });
  }
});

module.exports = router;

