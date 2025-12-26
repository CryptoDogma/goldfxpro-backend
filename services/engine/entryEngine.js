/**
 * entryEngine.js
 * Entry + SL + TP logic for v5
 */

function buildTrade({
  direction,
  price,
  sessionHigh,
  sessionLow,
  range,
  smcReason
}) {
  // STOP LOSS → beyond liquidity
  const stopLoss =
    direction === "BUY"
      ? sessionLow - 1
      : sessionHigh + 1;

  // TARGET → 50% of session range (mean reversion)
  const takeProfit =
    direction === "BUY"
      ? sessionLow + range * 0.5
      : sessionHigh - range * 0.5;

  // Confidence scoring
  let confidence = 0.75;

  if (smcReason.includes("Fair Value")) confidence += 0.05;
  if (smcReason.includes("Order Block")) confidence += 0.05;
  if (smcReason.includes("Reversal")) confidence += 0.05;

  confidence = Math.min(confidence, 0.90);

  return {
    status: "TRADE",
    bias: direction,
    stopLoss,
    takeProfit,
    confidence,
    quality: {
      grade: confidence >= 0.85 ? "A+" : "A",
      score: confidence
    }
  };
}

module.exports = { buildTrade };
