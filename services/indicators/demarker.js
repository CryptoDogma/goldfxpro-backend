/**
 * DeMarker Oscillator (14)
 * Returns array of DeMarker values aligned to candles
 */

function calculateDeMarker(candles, period = 14) {
  if (!candles || candles.length < period + 1) {
    return [];
  }

  const demax = [];
  const demin = [];

  for (let i = 1; i < candles.length; i++) {
    const highDiff = candles[i].high - candles[i - 1].high;
    const lowDiff = candles[i - 1].low - candles[i].low;

    demax.push(highDiff > 0 ? highDiff : 0);
    demin.push(lowDiff > 0 ? lowDiff : 0);
  }

  const demarker = [];

  for (let i = period; i < demax.length; i++) {
    const sumMax = demax.slice(i - period, i).reduce((a, b) => a + b, 0);
    const sumMin = demin.slice(i - period, i).reduce((a, b) => a + b, 0);

    const value =
      sumMax + sumMin === 0 ? 0.5 : sumMax / (sumMax + sumMin);

    demarker.push(value);
  }

  return demarker;
}

module.exports = {
  calculateDeMarker
};
