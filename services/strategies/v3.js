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
  const { price, candles, ema10, session } = context;

  if (!candles || candles.length < 30) {
    return { status: "WAIT", reason: "Not enough candle data" };
  }

  const dem = calculateDeMarker(candles, 14);
  if (!dem || dem.length < 2) {
    return { status: "WAIT", reason: "No DeMarker data" };
  }

  const prev = dem.at(-2);
  const curr = dem.at(-1);

  const exitOversold = prev <= 0.15 && curr > prev;
  const exitOverbought = prev >= 0.92 && curr < prev;

  const lastClose = candles.at(-1).close;
  const aboveEMA = lastClose > ema10;
  const belowEMA = lastClose < ema10;

  const swings = getSwingLevels(candles);
  const sessionLvls = getSessionLevels(candles, session);

  const atSupport =
    isNearLevel(price, swings?.swingLow) ||
    isNearLevel(price, sessionLvls?.sessionLow);

  const atResistance =
    isNearLevel(price, swings?.swingHigh) ||
    isNearLevel(price, sessionLvls?.sessionHigh);

  const fvgs = detectFVGs(candles);

  if (
    exitOversold &&
    aboveEMA &&
    (atSupport || priceInAnyFVG(price, fvgs, "bullish"))
  ) {
    return {
      status: "TRADE",
      bias: "BUY",
      confidence: 0.82,
      quality: { grade: "A", score: 0.82 },
      reason: "DeMarker exit + EMA10 + support/FVG"
    };
  }

  if (
    exitOverbought &&
    belowEMA &&
    (atResistance || priceInAnyFVG(price, fvgs, "bearish"))
  ) {
    return {
      status: "TRADE",
      bias: "SELL",
      confidence: 0.82,
      quality: { grade: "A", score: 0.82 },
      reason: "DeMarker exit + EMA10 + resistance/FVG"
    };
  }

  return { status: "WAIT", reason: "v3 conditions not met" };
};
