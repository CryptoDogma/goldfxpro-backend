/**
 * Strategy v3
 * Mean Reversion at Extreme + Location + EMA Permission
 */

const { calculateDeMarker } = require("../indicators/demarker");
const {
  getSwingLevels,
  getSessionLevels,
  isNearLevel
} = require("../structure/swingLevels");
const {
  detectFVGs,
  priceInAnyFVG
} = require("../structure/fvg");

module.exports = function runV3(context) {
  const {
    price,
    candles,
    ema10,
    session
  } = context;

  if (!candles || candles.length < 30) {
    return {
      status: "WAIT",
      reason: "Not enough candle data"
    };
  }

  // ─────────────────────────────────────────────
  // 1️⃣ DeMarker (14) + exit-from-extreme
  const demarkers = calculateDeMarker(candles, 14);
  if (demarkers.length < 2) {
    return {
      status: "WAIT",
      reason: "Insufficient DeMarker data"
    };
  }

  const prevDeM = demarkers[demarkers.length - 2];
  const currDeM = demarkers[demarkers.length - 1];

  const exitingOversold = prevDeM <= 0.15 && currDeM > prevDeM;
  const exitingOverbought = prevDeM >= 0.92 && currDeM < prevDeM;

  // ─────────────────────────────────────────────
  // 2️⃣ EMA 10 permission (close-based)
  const lastClose = candles[candles.length - 1].close;

  const aboveEMA = lastClose > ema10;
  const belowEMA = lastClose < ema10;

  // ─────────────────────────────────────────────
  // 3️⃣ Structure (Swing + Session)
  const swings = getSwingLevels(candles);
  const sessionLevels = getSessionLevels(candles, session);

  const atSupport =
    (swings && isNearLevel(price, swings.swingLow)) ||
    (sessionLevels && isNearLevel(price, sessionLevels.sessionLow));

  const atResistance =
    (swings && isNearLevel(price, swings.swingHigh)) ||
    (sessionLevels && isNearLevel(price, sessionLevels.sessionHigh));

  // ─────────────────────────────────────────────
  // 4️⃣ Fair Value Gaps
  const fvgs = detectFVGs(candles);

  const inBullishFVG = priceInAnyFVG(price, fvgs, "bullish");
  const inBearishFVG = priceInAnyFVG(price, fvgs, "bearish");

  // ─────────────────────────────────────────────
  // 🟢 BUY LOGIC
  if (
    exitingOversold &&
    aboveEMA &&
    (atSupport || inBullishFVG)
  ) {
    return {
      status: "TRADE",
      bias: "BUY",
      confidence: 0.82,
      quality: {
        grade: "A",
        score: 0.82
      },
      reason: "DeMarker exit from oversold + EMA10 hold + support/FVG"
    };
  }

  // ─────────────────────────────────────────────
  // 🔴 SELL LOGIC
  if (
    exitingOverbought &&
    belowEMA &&
    (atResistance || inBearishFVG)
  ) {
    return {
      status: "TRADE",
      bias: "SELL",
      confidence: 0.82,
      quality: {
        grade: "A",
        score: 0.82
      },
      reason: "DeMarker exit from overbought + EMA10 rejection + resistance/FVG"
    };
  }

  // ─────────────────────────────────────────────
  // ⛔ NO TRADE
  return {
    status: "WAIT",
    reason: "Conditions not aligned for Strategy v3"
  };
};
