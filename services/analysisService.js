const { evaluateRegime } = require("./regimeService");
const { determineBias } = require("./biasService");
const { evaluateLocation } = require("./locationService");
const { confirmTiming } = require("./timingService");
const { calculateQuality } = require("./qualityService");

function buildAnalysis({
  price,
  ema50,
  ema200,
  session,
  volatility,
  candles
}) {
  const regime = evaluateRegime({ session, volatility, ema50, ema200 });
  if (!regime.allowed) {
    return {
      status: "NO_TRADE",
      reason: regime.reason
    };
  }

  const bias = determineBias(ema50, ema200);
  if (bias === "NEUTRAL") {
    return { status: "NO_TRADE", reason: "Neutral bias" };
  }

  const location = evaluateLocation(price, ema50, bias);
  if (!location.valid) {
    return { status: "NO_TRADE", reason: location.reason };
  }

  const timing = confirmTiming(candles, bias);
  if (!timing) {
    return { status: "WAIT", reason: "No entry confirmation" };
  }

  const quality = calculateQuality({
    volatility,
    session,
    locationScore: location.score
  });

  if (quality.grade === "C") {
    return { status: "NO_TRADE", reason: "Low quality setup" };
  }

  return {
    status: "TRADE",
    bias,
    quality,
    confidence: quality.score
  };
}

module.exports = { buildAnalysis };
