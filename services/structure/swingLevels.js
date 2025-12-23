/**
 * swingLevels.js
 * Detects recent swing highs/lows + session levels
 */

function getSwingLevels(candles, lookback = 20) {
  if (!candles || candles.length < lookback + 2) {
    return null;
  }

  const recent = candles.slice(-lookback);

  let swingHigh = recent[0].high;
  let swingLow = recent[0].low;

  for (const c of recent) {
    if (c.high > swingHigh) swingHigh = c.high;
    if (c.low < swingLow) swingLow = c.low;
  }

  return {
    swingHigh,
    swingLow
  };
}

function getSessionLevels(candles, session) {
  if (!candles || candles.length === 0) return null;

  // Approx session candle count for M15
  const sessionCandles = session === "London"
    ? 32   // ~8 hours
    : session === "New York"
    ? 28   // ~7 hours
    : 16;  // Asia or fallback

  const recent = candles.slice(-sessionCandles);

  let high = recent[0].high;
  let low = recent[0].low;

  for (const c of recent) {
    if (c.high > high) high = c.high;
    if (c.low < low) low = c.low;
  }

  return {
    sessionHigh: high,
    sessionLow: low
  };
}

function isNearLevel(price, level, tolerance = 0.002) {
  // tolerance as % of price (0.2%)
  return Math.abs(price - level) / price <= tolerance;
}

module.exports = {
  getSwingLevels,
  getSessionLevels,
  isNearLevel
};
