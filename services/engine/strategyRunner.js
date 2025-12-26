const db = require("../../utils/fileDb");
const { getGoldPrice, getGoldCandles } = require("../priceService");
const { getSessionInfo } = require("../sessionService");
const { calculateEMA } = require("../emaService");
const { runStrategy } = require("../strategies");

async function runAllStrategies() {
  const price = await getGoldPrice();
  const candles = await getGoldCandles();
  const sessionInfo = getSessionInfo();

  const closes = candles.map(c => c.close);

  const context = {
    price,
    candles,
    session: sessionInfo.session,
    volatility: sessionInfo.volatility,
    ema10: calculateEMA(closes.slice(-10), 10),
    ema50: calculateEMA(closes.slice(-50), 50),
    ema200: calculateEMA(closes.slice(-200), 200)
  };

  const STRATEGIES = ["v1", "v2", "v3", "v4"];
  const results = [];

  for (const strat of STRATEGIES) {
    try {
      const r = await runStrategy(strat, context);
      if (r.status === "TRADE") {
        results.push({ strategy: strat, ...r });
      }
    } catch (err) {
      console.error(`Strategy ${strat} failed`, err.message);
    }
  }

  if (!results.length) {
    db.write("currentSignal.json", {
      status: "WAIT",
      timestamp: new Date().toISOString()
    });
    return;
  }

  // 🧠 pick best trade (highest confidence)
  const best = results.sort((a, b) => b.confidence - a.confidence)[0];

  db.write("currentSignal.json", {
    ...best,
    pair: "XAUUSD",
    timeframe: "M15",
    timestamp: new Date().toISOString()
  });
}

module.exports = { runAllStrategies };
