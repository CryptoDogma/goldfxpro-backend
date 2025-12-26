/**
 * smcConfirmation.js
 * Smart Money confirmation logic
 */

const { detectFVGs, priceInAnyFVG } = require("../structure/fvg");
const { getSwingLevels } = require("../structure/swingLevels");
const { detectReversalCandle } = require("../candles/reversal");

function confirmSMC({
  candles,
  price,
  direction
}) {
  if (!candles || candles.length < 20) {
    return { confirmed: false, reason: "Insufficient candles" };
  }

  // 1️⃣ Fair Value Gaps
  const fvgs = detectFVGs(candles);

  const inFVG =
    direction === "BUY"
      ? priceInAnyFVG(price, fvgs, "bullish")
      : priceInAnyFVG(price, fvgs, "bearish");

  // 2️⃣ Swing structure (Order Block proxy)
  const swings = getSwingLevels(candles);

  const atOB =
    direction === "BUY"
      ? swings?.swingLow && Math.abs(price - swings.swingLow) < 3
      : swings?.swingHigh && Math.abs(price - swings.swingHigh) < 3;

  // 3️⃣ Reversal candle
  const reversal = detectReversalCandle(candles);

  const reversalConfirmed =
    reversal &&
    ((direction === "BUY" && reversal.type === "bullish") ||
     (direction === "SELL" && reversal.type === "bearish"));

  // 4️⃣ Final decision
  if (inFVG || atOB || reversalConfirmed) {
    return {
      confirmed: true,
      reason: inFVG
        ? "Price in Fair Value Gap"
        : atOB
        ? "Order Block reaction"
        : "Reversal candle confirmation"
    };
  }

  return {
    confirmed: false,
    reason: "No SMC confirmation"
  };
}

module.exports = { confirmSMC };
