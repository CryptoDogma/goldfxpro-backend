const db = require("../../utils/fileDb");
const { getGoldPrice, getGoldCandles } = require("../priceService");
const { getSessionInfo } = require("../sessionService");
const { calculateEMA } = require("../emaService");
const { runStrategy } = require("../strategies");
const { sendWhatsApp } = require("../whatsappService");
const { buildTradeMessage } = require("../whatsappFormatter");

/**
 * WhatsApp auto-send helper (SAFE, SINGLE POINT)
 */
async function autoSendWhatsApp(signal) {
  try {
    const ALLOWED_STRATEGIES = ["v3", "v4"];
    const MIN_CONFIDENCE = 0.75;

    if (
      !signal ||
      !ALLOWED_STRATEGIES.includes(signal.strategy) ||
      signal.confidence < MIN_CONFIDENCE
    ) {
      return;
    }

    const users = db.read("users.json") || [];

    for (const user of users) {
      if (!user.phone || !user.whatsappOptIn) continue;

      await sendWhatsApp(
        user.phone,
        buildTradeMessage(signal)
      );
    }

    console.log(
      `📲 WhatsApp sent → ${signal.strategy.toUpperCase()} ${signal.direction}`
    );
  } catch (err) {
    console.error("❌ WhatsApp auto-send failed:", err.message);
  }
}

/**
 * Runs all strategies & selects best signal
 */
async function runAllStrategies() {
  console.log("🔁 Running strategy engine…");

  // 1️⃣ Market data
  const price = await getGoldPrice();
  const candles = await getGoldCandles();
  if (!candles || candles.length < 200) {
    console.log("⛔ Not enough candle data");
    return;
  }

  const closes = candles.map(c => c.close);

  const ema10  = calculateEMA(closes.slice(-10), 10);
  const ema50  = calculateEMA(closes.slice(-50), 50);
  const ema200 = calculateEMA(closes.slice(-200), 200);

  const sessionInfo = getSessionInfo();

  // 2️⃣ Evaluate strategies
  const STRATEGIES = ["v1", "v2", "v3", "v4"];
  const results = [];

  for (const strategy of STRATEGIES) {
    try {
      const result = await runStrategy(strategy, {
        price,
        ema10,
        ema50,
        ema200,
        session: sessionInfo.session,
        volatility: sessionInfo.volatility,
        candles
      });

      if (result?.status === "TRADE") {
        results.push({
          ...result,
          strategy
        });
      }

      console.log(`✔ Strategy ${strategy} evaluated`);
    } catch (err) {
      console.error(`❌ Strategy ${strategy} failed:`, err.message);
    }
  }

  // 3️⃣ No trade
  if (results.length === 0) {
    db.write("currentSignal.json", {
      status: "WAIT",
      session: sessionInfo.session,
      volatility: sessionInfo.volatility,
      timestamp: new Date().toISOString()
    });

    console.log("⚪ No valid trades");
    return;
  }

  // 4️⃣ Pick BEST trade
  results.sort((a, b) => {
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence;
    }
    return (b.quality?.score || 0) - (a.quality?.score || 0);
  });

  const best = results[0];

  const signal = {
    pair: "XAUUSD",
    timeframe: "M15",
    strategy: best.strategy,
    direction: best.bias,
    entry: price.toFixed(2),
    stopLoss: best.stopLoss != null ? best.stopLoss.toFixed(2) : null,
    takeProfit: best.takeProfit != null ? best.takeProfit.toFixed(2) : null,
    session: sessionInfo.session,
    volatility: sessionInfo.volatility,
    confidence: best.confidence,
    analysis: {
      qualityGrade: best.quality?.grade,
      qualityScore: best.quality?.score
    },
    reasoning: best.reason,
    timestamp: new Date().toISOString()
  };

  // 5️⃣ Save single source of truth
  db.write("currentSignal.json", signal);

  // 6️⃣ WhatsApp (ONLY HERE)
  await autoSendWhatsApp(signal);

  console.log(
    `✅ ACTIVE SIGNAL → ${signal.strategy.toUpperCase()} ${signal.direction}`
  );
}

module.exports = { runAllStrategies };
