const { calculateEMA } = require("../emaService");
const { buildAnalysis } = require("../analysisService");
const { getGoldCandlesH1 } = require("../priceService");

async function runV2({
  price,
  ema50,
  ema200,
  session,
  volatility,
  candles
}) {
  // 1️⃣ Get H1 candles
  const h1Candles = await getGoldCandlesH1();
  if (!h1Candles || h1Candles.length < 200) {
    return {
      status: "NO_TRADE",
      reason: "Not enough H1 data",
      strategy: "v2"
    };
  }

  const h1Closes = h1Candles.map(c => c.close);
  const h1Ema50 = calculateEMA(h1Closes.slice(-50), 50);
  const h1Ema200 = calculateEMA(h1Closes.slice(-200), 200);

  const htfBias =
    h1Ema50 > h1Ema200 ? "BUY" :
    h1Ema50 < h1Ema200 ? "SELL" :
    "NEUTRAL";

  if (htfBias === "NEUTRAL") {
    return {
      status: "NO_TRADE",
      reason: "Higher timeframe neutral",
      strategy: "v2"
    };
  }

  // 2️⃣ Run base analysis (v1 logic)
  const base = buildAnalysis({
    price,
    ema50,
    ema200,
    session,
    volatility,
    candles
  });

  if (base.status !== "TRADE") {
    return {
      ...base,
      strategy: "v2"
    };
  }

  // 3️⃣ Alignment check
  if (base.bias !== htfBias) {
    return {
      status: "NO_TRADE",
      reason: "Lower TF not aligned with H1 bias",
      strategy: "v2"
    };
  }

  // 4️⃣ Boost quality (HTF confirmation)
  const boostedQuality = {
    grade: base.quality.grade === "A" ? "A+" : "A",
    score: Math.min(base.quality.score + 0.1, 1)
  };

  return {
    status: "TRADE",
    strategy: "v2",
    bias: base.bias,
    confidence: boostedQuality.score,
    quality: boostedQuality,
    context: {
      htfBias
    }
  };
}

module.exports = function runV2(context) {
  return {
    status: "WAIT",
    reason: "Strategy v2 scaffold"
  };
};

