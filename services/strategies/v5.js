/**
 * Strategy v5
 * ORB (Opening Range Breakout) + Smart Money Concepts
 */

const { getSessionLevels } = require("../session/sessionLevels");
const { detectFVGs, priceInAnyFVG } = require("../structure/fvg");
const { detectReversalCandle } = require("../candles/reversal");
const { buildTrade } = require("../engine/entryEngine");

module.exports = async function runV5(context) {
  const {
    candles,
    price,
    session
  } = context;

  if (!candles || candles.length < 30) {
    return {
      status: "WAIT",
      reason: "Insufficient candle data"
    };
  }

  // ─────────────────────────────────────────────
  // 1️⃣ SESSION OPENING RANGE
  const sessionData = getSessionLevels(candles, session);

  if (!sessionData || !sessionData.firstCandle) {
    return {
      status: "WAIT",
      reason: "Session opening candle unavailable"
    };
  }

  const { sessionHigh, sessionLow } = sessionData;
  const range = sessionHigh - sessionLow;

  if (range <= 0) {
    return {
      status: "WAIT",
      reason: "Invalid session range"
    };
  }

  // ─────────────────────────────────────────────
  // 2️⃣ ORB BREAKOUT (CLOSE OUTSIDE RANGE)
  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];

  const breakoutUp =
    prevCandle.close <= sessionHigh &&
    lastCandle.close > sessionHigh;

  const breakoutDown =
    prevCandle.close >= sessionLow &&
    lastCandle.close < sessionLow;

  if (!breakoutUp && !breakoutDown) {
    return {
      status: "WAIT",
      reason: "No ORB breakout"
    };
  }

  const direction = breakoutUp ? "BUY" : "SELL";

  // ─────────────────────────────────────────────
  // 3️⃣ PRICE MUST RETURN INTO RANGE (FAKE-OUT)
  const returnedIntoRange =
    price <= sessionHigh &&
    price >= sessionLow;

  if (!returnedIntoRange) {
    return {
      status: "WAIT",
      reason: "Price has not returned into ORB range"
    };
  }

  // ─────────────────────────────────────────────
  // 4️⃣ SMART MONEY CONFIRMATION
  const fvgs = detectFVGs(candles);

  const inBullishFVG =
    direction === "BUY" &&
    priceInAnyFVG(price, fvgs, "bullish");

  const inBearishFVG =
    direction === "SELL" &&
    priceInAnyFVG(price, fvgs, "bearish");

  const reversal = detectReversalCandle(candles);

  if (!inBullishFVG && !inBearishFVG && !reversal) {
    return {
      status: "WAIT",
      reason: "No Smart Money confirmation"
    };
  }

  let smcReason = "";

  if (inBullishFVG || inBearishFVG) {
    smcReason += "Fair Value Gap ";
  }

  if (reversal) {
    smcReason += "Reversal Candle ";
  }

  // ─────────────────────────────────────────────
  // 5️⃣ ENTRY + RISK ENGINE
  const trade = buildTrade({
    direction,
    price,
    sessionHigh,
    sessionLow,
    range,
    smcReason
  });

  return {
    ...trade,
    reason: `ORB fake-out + ${smcReason.trim()}`
  };
};
