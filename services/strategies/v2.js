const { calculateEMA } = require("../emaService");
const { buildAnalysis } = require("../analysisService");
const { getGoldCandlesH1 } = require("../priceService");

module.exports = async function runV2(context) {
  const {
    price,
    ema50,
    ema200,
    session,
    volatility,
    candles
  } = context;

  const h1Candles = await getGoldCandlesH1();
  if (!h1Candles || h1Candles.length < 200) {
    return {
      status: "WAIT",
      reason: "Not enough H1 data"
    };
  }

  const h1Closes = h1Candles.map(c => c.close);
  const h1Ema50 = calculateEMA(h1Closes.slice(-50), 50);
  const h1Ema200 = calculateEMA(h1Closes.slice(-200), 200);

  const htfBias =
    h1Ema50 > h1Ema200 ? "BUY" :
    h1Ema50 < h1Ema200 ? "SELL" :
    null;

  if (!htfBias) {
    return {
      status: "WAIT",
      reason: "Higher timeframe neutral"
    };
  }

  const base = buildAnalysis({
    price,
    ema50,
    ema200,
    session,
    volatility,
    candles
  });

  if (base.status !== "TRADE") {
    return base;
  }

  if (base.bias !== htfBias) {
    return {
      status: "WAIT",
      reason: "Lower TF not aligned with H1 bias"
    };
  }

  return {
    status: "TRADE",
    bias: base.bias,
    confidence: Math.min(base.confidence + 0.1, 1),
    quality: {
      grade: "A+",
      score: Math.min(base.quality.score + 0.1, 1)
    },
    reason: "HTF aligned confirmation"
  };
};
