const { buildAnalysis } = require("../analysisService");

module.exports = async function runV1(context) {
  const {
    price,
    ema50,
    ema200,
    session,
    volatility,
    candles
  } = context;

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
      reason: analysis.reason
    };
  }

  return {
    status: "TRADE",
    bias: analysis.bias,
    confidence: analysis.confidence,
    quality: analysis.quality,
    reason: analysis.reason
  };
};
