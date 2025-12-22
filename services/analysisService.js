function trendStrength(emaFast, emaSlow, price) {
  const dist = Math.abs(emaFast - emaSlow);
  const pct = dist / price; // normalized
  if (pct > 0.006) return { label: "Strong", score: 1.0 };
  if (pct > 0.003) return { label: "Moderate", score: 0.7 };
  return { label: "Weak", score: 0.4 };
}

function trendAge(biasBars) {
  if (biasBars >= 30) return { label: "Mature", score: 1.0 };
  if (biasBars >= 10) return { label: "Developing", score: 0.7 };
  return { label: "Early", score: 0.4 };
}

function volatilityState(atrPct) {
  if (atrPct > 0.008) return { label: "Aggressive", score: 0.6 };
  if (atrPct > 0.004) return { label: "Normal", score: 1.0 };
  return { label: "Quiet", score: 0.8 };
}

function gradeFromScore(score) {
  if (score >= 0.85) return "A";
  if (score >= 0.7) return "B";
  if (score >= 0.55) return "C";
  return "D";
}

function buildAnalysis({ emaFast, emaSlow, price, biasBars, atrPct }) {
  const tStrength = trendStrength(emaFast, emaSlow, price);
  const tAge = trendAge(biasBars);
  const vol = volatilityState(atrPct);

  const score =
    (tStrength.score * 0.4) +
    (tAge.score * 0.35) +
    (vol.score * 0.25);

  return {
    trendStrength: tStrength.label,
    trendAge: tAge.label,
    volatility: vol.label,
    qualityScore: Number(score.toFixed(2)),
    qualityGrade: gradeFromScore(score),
    explanation:
      `Trend is ${tStrength.label.toLowerCase()} and ${tAge.label.toLowerCase()}, ` +
      `volatility is ${vol.label.toLowerCase()}.`
  };
}

module.exports = { buildAnalysis };
