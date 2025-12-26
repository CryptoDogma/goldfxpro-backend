/**
 * strategyRunner.js
 * Runs all strategies and selects the best signal
 */

const db = require("../fileDb");
const { getGoldPrice, getGoldCandles } = require("../priceService");
const { getSessionInfo } = require("../sessionService");
const { calculateEMA } = require("../emaService");
const { runStrategy } = require("../strategies");
const { getActiveStrategy } = require("../strategyConfig");

// Strategy priority (higher wins)
const STRATEGY_PRIORITY = {
  v4: 4,
  v3: 3,
  v2: 2,
  v1: 1
};

async function runAllStrategies() {
  try {
    const price = await getGoldPrice();
    const candles = await getGoldCandles();
    const sessionInfo = getSessionInfo();

    if (!candles || candles.length < 200) {
      console.log("[ENGINE] Not enough candle data");
      return;
    }

    const closes = candles.map(c => c.close);

    const ema10 = calculateEMA(closes.slice(-10), 10);
    const ema50 = calculateEMA(closes.slice(-50), 50);
    const ema200 = calculateEMA(closes.slice(-200), 200);

    const strategies = ["v1", "v2", "v3", "v4"];
    const results = [];

    for (const strategy of strategies) {
      const result = await runStrategy(strategy, {
        price,
        candles,
        ema10,
        ema50,
        ema200,
        session: sessionInfo.session,
        volatility: sessionInfo.volatility
      });

      if (result.status === "TRADE") {
        results.push({
          strategy,
          ...result
        });
      }
    }

    if (!results.length) {
      db.write("currentSignal.json", {
        status: "WAIT",
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Pick best by priority → confidence
    results.sort((a, b) => {
      const p =
        STRATEGY_PRIORITY[b.strategy] -
        STRATEGY_PRIORITY[a.strategy];
      if (p !== 0) return p;
      return b.confidence - a.confidence;
    });

    const best = results[0];

    const signal = {
      pair: "XAUUSD",
      timeframe: "M15",
      strategy: best.strategy,
      direction: best.bias,
      entry: price.toFixed(2),
      stopLoss: best.stopLoss,
      takeProfit: best.takeProfit,
      session: sessionInfo.session,
      volatility: sessionInfo.volatility,
      confidence: best.confidence,
      analysis: best.quality,
      reasoning: best.reason,
      timestamp: new Date().toISOString()
    };

    db.write("currentSignal.json", signal);
    console.log(`[ENGINE] Signal updated (${signal.strategy})`);

  } catch (err) {
    console.error("[ENGINE] Failure:", err.message);
  }
}

module.exports = { runAllStrategies };
