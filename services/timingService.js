function confirmTiming(candles, bias) {
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  if (bias === "BUY") {
    return last.close > last.open && last.low < prev.low;
  }

  if (bias === "SELL") {
    return last.close < last.open && last.high > prev.high;
  }

  return false;
}

module.exports = { confirmTiming };
