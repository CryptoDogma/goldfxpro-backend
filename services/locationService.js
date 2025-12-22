function evaluateLocation(price, ema50, bias) {
  const distance = Math.abs(price - ema50);

  if (distance > 12) {
    return {
      valid: false,
      score: 0,
      reason: "Price too far from mean"
    };
  }

  return {
    valid: true,
    score: 1 - distance / 12
  };
}

module.exports = { evaluateLocation };
