/**
 * fvg.js
 * Fair Value Gap detection (3-candle imbalance)
 */

function detectFVGs(candles, lookback = 50) {
  if (!candles || candles.length < 3) return [];

  const fvgs = [];
  const recent = candles.slice(-lookback);

  for (let i = 2; i < recent.length; i++) {
    const c0 = recent[i - 2];
    const c1 = recent[i - 1];
    const c2 = recent[i];

    // 🟢 Bullish FVG
    if (c0.high < c2.low) {
      fvgs.push({
        type: "bullish",
        top: c2.low,
        bottom: c0.high,
        index: i
      });
    }

    // 🔴 Bearish FVG
    if (c0.low > c2.high) {
      fvgs.push({
        type: "bearish",
        top: c0.low,
        bottom: c2.high,
        index: i
      });
    }
  }

  return fvgs;
}

function priceInFVG(price, fvg, tolerance = 0.001) {
  if (!fvg) return false;

  const upper = Math.max(fvg.top, fvg.bottom);
  const lower = Math.min(fvg.top, fvg.bottom);

  // allow slight tolerance (0.1%)
  const tol = price * tolerance;

  return price >= lower - tol && price <= upper + tol;
}

function priceInAnyFVG(price, fvgs, type) {
  return fvgs.some(fvg =>
    fvg.type === type && priceInFVG(price, fvg)
  );
}

module.exports = {
  detectFVGs,
  priceInFVG,
  priceInAnyFVG
};
