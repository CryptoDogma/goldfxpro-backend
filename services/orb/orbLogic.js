/**
 * orbLogic.js
 * Detect ORB breakout vs fake-out (liquidity grab)
 */

function detectORBEvent(candles, orbHigh, orbLow) {
  if (!candles || candles.length < 2) return null;

  const prev = candles[candles.length - 2];
  const curr = candles[candles.length - 1];

  // --- Break above ORB ---
  if (prev.close <= orbHigh && curr.high > orbHigh) {
    // Fake-out: rejection back inside
    if (curr.close < orbHigh) {
      return {
        type: "FAKEOUT_HIGH",
        side: "SELL",
        level: orbHigh
      };
    }

    // True breakout
    if (curr.close > orbHigh) {
      return {
        type: "BREAKOUT_HIGH",
        side: "BUY",
        level: orbHigh
      };
    }
  }

  // --- Break below ORB ---
  if (prev.close >= orbLow && curr.low < orbLow) {
    // Fake-out: rejection back inside
    if (curr.close > orbLow) {
      return {
        type: "FAKEOUT_LOW",
        side: "BUY",
        level: orbLow
      };
    }

    // True breakout
    if (curr.close < orbLow) {
      return {
        type: "BREAKOUT_LOW",
        side: "SELL",
        level: orbLow
      };
    }
  }

  return null;
}

module.exports = { detectORBEvent };
