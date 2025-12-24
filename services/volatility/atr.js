/**
 * atr.js
 * Daily ATR calculator (simple & stable)
 */

function getDailyATR(candles, period = 14) {
  if (!candles || candles.length < period + 1) {
    return null;
  }

  let trs = [];

  for (let i = 1; i <= period; i++) {
    const curr = candles[candles.length - i];
    const prev = candles[candles.length - i - 1];

    const highLow = curr.high - curr.low;
    const highClose = Math.abs(curr.high - prev.close);
    const lowClose = Math.abs(curr.low - prev.close);

    trs.push(Math.max(highLow, highClose, lowClose));
  }

  const atr =
    trs.reduce((sum, v) => sum + v, 0) / trs.length;

  return atr;
}

module.exports = { getDailyATR };
