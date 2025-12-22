function determineBias(ema50, ema200) {
  if (ema50 > ema200) return "BUY";
  if (ema50 < ema200) return "SELL";
  return "NEUTRAL";
}

module.exports = { determineBias };
