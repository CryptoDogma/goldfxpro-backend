const { buildAnalysis } = require("../analysisService");

async function runV1({
  price,
  ema50,
  ema200,
  session,
  volatility,
  candles
}) {
  const analysis = buildAnalysis({
    price,
    ema50,
    ema200,
    session,
    volatility,
    candles
  });

  if (analysis.status !== "TRADE") {
    return {
      status: analysis.status,
      reason: analysis.reason,
      strategy: "v1"
    };
  }

  return {
    status: "TRADE",
    strategy: "v1",
    bias: analysis.bias,
    confidence: analysis.confidence,
    quality: analysis.quality
  };
}

module.exports = function runV1(context) {
  return {
    status: "WAIT",
    reason: "Strategy v1 scaffold"
  };
};


