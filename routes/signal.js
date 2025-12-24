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
const { sendWhatsApp } = require("../services/whatsappService");
const { buildTradeMessage } = require("../services/whatsappFormatter");

const router = express.Router();

router.get("/signal", auth, async (req, res) => {
  try {
    // 1️⃣ Active strategy
    const activeStrategy = getActiveStrategy();

    // 2️⃣ Live price
    const price = await getGoldPrice();

    // 3️⃣ Candle data
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

    // 6️⃣ Run strategy
    const result = await runStrategy(activeStrategy, {
      price,
      ema10,
      ema50,
      ema200,
      session: sessionInfo.session,
      volatility: sessionInfo.volatility,
      candles
    });

    // 🚫 NO TRADE
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

    // 7️⃣ Trade parameters
    const direction = result.bias;
    const stopLoss =
      result.stopLoss != null
      ? result.stopLoss
       : direction === "BUY"
      ? price - 10
        : price + 10;

      const takeProfit =
        result.takeProfit != null
        ? result.takeProfit
        : direction === "BUY"
        ? price + 20
        : price - 20;

    // 8️⃣ Build signal
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

    // 9️⃣ Save history
    const history = db.read("signals.json") || [];
    history.unshift(signal);
    db.write("signals.json", history.slice(0, 20));

    // 🔔 10️⃣ AUTO-SEND WHATSAPP (SAFE + CONTROLLED)
    try {
      const ALLOWED_STRATEGIES = ["v3", "v4"];
      const MIN_CONFIDENCE = 0.75;

      if (
        ALLOWED_STRATEGIES.includes(signal.strategy) &&
        signal.confidence >= MIN_CONFIDENCE
      ) {
        const users = db.read("users.json") || [];

        for (const user of users) {
          if (!user.phone || !user.whatsappOptIn) continue;

          await sendWhatsApp(
            user.phone,
            buildTradeMessage(signal)
          );
        }
      }
    } catch (err) {
      console.error("WhatsApp auto-send failed:", err.message);
    }

    // 🔟 Respond
    res.json(signal);

  } catch (err) {
    console.error("Signal error:", err);
    res.status(500).json({ error: "Signal engine failure" });
  }
});

module.exports = router;

