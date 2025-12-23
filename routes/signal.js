/**
 * signal.js
 * GOLD FX PRO – Strategy Engine (Versioned, Admin-Controlled)
 */

const express = require("express");
const auth = require("../middleware/auth");
const db = require("../utils/fileDb");

const { getGoldPrice, getGoldCandles } = require("../services/priceService");
const { getSessionInfo } = require("../services/sessionService");
const { calculateEMA } = require("../services/emaService");
const { runStrategy } = require("../services/strategies");
const { getActiveStrategy } = require("../services/strategyConfig");


const router = express.Router();

// 🔑 SINGLE SOURCE OF TRUTH (ADMIN CONTROLLED)
//function getActiveStrategy() {
 // const config = db.read("config.json");
 // return config?.activeStrategy || "v1";
//}

router.get("/signal", auth, async (req, res) => {
  try {
    // 1️⃣ Active strategy (READ EVERY REQUEST)
    const activeStrategy = getActiveStrategy();

    // 2️⃣ Live price
    const price = await getGoldPrice();

    // 3️⃣ Candle data (OHLC expected)
    const candles = await getGoldCandles();
    if (!candles || candles.length < 200) {
      return res.status(500).json({ error: "Not enough candle data" });
    }

    // 4️⃣ EMA calculations
    const closes = candles.map(c => c.close);

    const ema10  = calculateEMA(closes.slice(-10), 10);
    const ema50  = calculateEMA(closes.slice(-50), 50);
    const ema200 = calculateEMA(closes.slice(-200), 200);

    // 5️⃣ Session info
    const sessionInfo = getSessionInfo();

    // 6️⃣ Run ACTIVE strategy
    const result = await runStrategy(activeStrategy, {
      price,
      ema10,
      ema50,
      ema200,
      session: sessionInfo.session,
      volatility: sessionInfo.volatility,
      candles
    });

    // 🚫 WAIT / NO TRADE
    if (result.status !== "TRADE") {
      return res.json({
        status: result.status,
        reason: result.reason,
        strategy: activeStrategy,
        session: sessionInfo.session,
        volatility: sessionInfo.volatility,
        timestamp: new Date().toISOString()
      });
    }

    // 7️⃣ Trade parameters (fixed RR for now)
    const direction = result.bias;
    const stopLoss = direction === "BUY" ? price - 10 : price + 10;
    const takeProfit = direction === "BUY" ? price + 20 : price - 20;

    // 8️⃣ Build signal object
    const signal = {
      pair: "XAUUSD",
      timeframe: "M15",
      strategy: activeStrategy,
      direction,
      entry: price.toFixed(2),
      stopLoss: stopLoss.toFixed(2),
      takeProfit: takeProfit.toFixed(2),
      session: sessionInfo.session,
      volatility: sessionInfo.volatility,
      confidence: Number(result.confidence.toFixed(2)),
      analysis: {
        trendStrength: Math.abs(ema50 - ema200).toFixed(2),
        trendAge: "Active",
        volatility: sessionInfo.volatility,
        qualityGrade: result.quality.grade,
        qualityScore: result.quality.score
      },
      reasoning: `Strategy ${activeStrategy.toUpperCase()}: ${result.reason}`,
      timestamp: new Date().toISOString()
    };

    // 9️⃣ Save history (latest 20 only)
    const history = db.read("signals.json") || [];
    history.unshift(signal);
    db.write("signals.json", history.slice(0, 20));

    // 🔟 Respond
    res.json(signal);

  } catch (err) {
    console.error("Signal error:", err);
    res.status(500).json({ error: "Signal engine failure" });
  }
});

module.exports = router;

