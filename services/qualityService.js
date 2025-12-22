function calculateQuality({ volatility, session, locationScore }) {
  let score = 0;

  if (volatility === "High") score += 0.4;
  if (session === "London" || session === "New York") score += 0.3;
  score += locationScore * 0.3;

  let grade = "C";
  if (score >= 0.8) grade = "A";
  else if (score >= 0.6) grade = "B";

  return {
    score: Number(score.toFixed(2)),
    grade
  };
}

module.exports = { calculateQuality };
