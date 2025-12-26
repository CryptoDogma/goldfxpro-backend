/**
 * Strategy v5
 * ORB (Opening Range Breakout) + Smart Money Concepts
 * with M5 Refinement Mode (Scalping Precision)
 */

const { getSessionLevels } = require("../session/sessionLevels");
const { detectFVGs, priceInAnyFVG } = require("../structure/fvg");
const { detectReversalCandle } = require("../candles/reversal");
const { getGoldCandlesM5 } = require("../priceService");
const { refineV5M5 } = require("./v5RefineM5");

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
  // 1️⃣ SESSION OPENING RANGE (ORB)
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

  const bias = breakoutUp ? "BUY" : "SELL";

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
  // 4️⃣ SMART MONEY CONTEXT (M15)
  const fvgs = detectFVGs(candles);

  const inBullishFVG =
    bias === "BUY" &&
    priceInAnyFVG(price, fvgs, "bullish");

  const inBearishFVG =
    bias === "SELL" &&
    priceInAnyFVG(price, fvgs, "bearish");

  const reversal = detectReversalCandle(candles);

  if (!inBullishFVG && !inBearishFVG && !reversal) {
    return {
      status: "WAIT",
      reason: "No Smart Money confirmation (M15)"
    };
  }

  // ─────────────────────────────────────────────
  // 5️⃣ M5 REFINEMENT MODE (SCALPING ENTRY)
  const candlesM5 = await getGoldCandlesM5();

  const refine = refineV5M5({
    bias,
    price,
    candlesM5,
    orb: {
      high: sessionHigh,
      low: sessionLow
    }
  });

  if (refine.status !== "TRADE") {
    return {
      status: "WAIT",
      reason: refine.reason || "Refining on M5",
      context: "M5 refinement"
    };
  }

  // ─────────────────────────────────────────────
  // ✅ FINAL CONFIRMED TRADE
  return {
    status: "TRADE",
    bias,
    confidence: refine.confidence,
    quality: refine.quality,
    stopLoss: refine.stopLoss,
    takeProfit: refine.takeProfit,
    reason: `v5 ORB fake-out + M5 refinement`
  };
};
