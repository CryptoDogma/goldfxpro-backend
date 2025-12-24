/**
 * reversal.js
 * Detect simple institutional reversal candles
 */

function detectReversalCandle(candles) {
  if (!candles || candles.length < 2) return null;

  const prev = candles[candles.length - 2];
  const curr = candles[candles.length - 1];

  const body = Math.abs(curr.close - curr.open);
  const range = curr.high - curr.low;

  if (range === 0) return null;

  const upperWick = curr.high - Math.max(curr.close, curr.open);
  const lowerWick = Math.min(curr.close, curr.open) - curr.low;

  // 🔴 Shooting Star / Bearish rejection
  if (
    upperWick > body * 2 &&
    curr.close < curr.open
  ) {
    return { type: "bearish" };
  }

  // 🟢 Hammer / Bullish rejection
  if (
    lowerWick > body * 2 &&
    curr.close > curr.open
  ) {
    return { type: "bullish" };
  }

  return null;
}

module.exports = { detectReversalCandle };
