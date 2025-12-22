function evaluateRegime({ session, volatility, ema50, ema200 }) {
  if (session === "Asia" && volatility === "Low") {
    return {
      allowed: false,
      reason: "Low volatility Asian session"
    };
  }

  const emaDistance = Math.abs(ema50 - ema200);
  if (emaDistance < 2) {
    return {
      allowed: false,
      reason: "No clear trend (EMA compression)"
    };
  }

  return {
    allowed: true
  };
}

module.exports = { evaluateRegime };
