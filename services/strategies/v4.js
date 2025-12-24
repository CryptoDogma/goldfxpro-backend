/**
 * Strategy v4
 * Session Range Fake-out + ATR Context
 */

const { getSessionLevels } = require("../session/sessionLevels");
const { detectReversalCandle } = require("../candles/reversal");
const { getDailyATR } = require("../volatility/atr");

module.exports = function runV4(context) {
  const {
    candles,
    session,
    price
  } = context;

  if (!candles || candles.length < 50) {
    return {
      status: "WAIT",
      reason: "Insufficient candle data"
    };
  }

  // ─────────────────────────────────────────────
  // 1️⃣ Session first candle (15m)
  const sessionLevels = getSessionLevels(candles, session);

  if (!sessionLevels || !sessionLevels.firstCandle) {
    return {
      status: "WAIT",
      reason: "Session candle not available"
    };
  }

  const {
    high: sessionHigh,
    low: sessionLow
  } = sessionLevels.firstCandle;

  const sessionRange = sessionHigh - sessionLow;

  // ─────────────────────────────────────────────
  // 2️⃣ Daily ATR context
  const dailyATR = getDailyATR();
  const atrThreshold = dailyATR * 0.20;

  if (sessionRange < atrThreshold) {
    return {
      status: "WAIT",
      reason: "Session range too small vs ATR"
    };
  }

  // ─────────────────────────────────────────────
  // 3️⃣ Fake-out detection
  const lastClose = candles[candles.length - 1].close;

  const fakeBreakHigh =
    lastClose < sessionHigh &&
    price > sessionHigh;

  const fakeBreakLow =
    lastClose > sessionLow &&
    price < sessionLow;

  // ─────────────────────────────────────────────
  // 4️⃣ Reversal candle confirmation
  const reversal = detectReversalCandle(candles);

  if (!reversal) {
    return {
      status: "WAIT",
      reason: "No reversal candle confirmation"
    };
  }

  // ─────────────────────────────────────────────
  // 🔴 SELL LOGIC
  if (fakeBreakHigh && reversal.type === "bearish") {
    return {
      status: "TRADE",
      bias: "SELL",
      confidence: 0.80,
      quality: {
        grade: "A",
        score: 0.80
      },
      reason: "Session high fake-out + bearish reversal"
    };
  }

  // ─────────────────────────────────────────────
  // 🟢 BUY LOGIC
  if (fakeBreakLow && reversal.type === "bullish") {
    return {
      status: "TRADE",
      bias: "BUY",
      confidence: 0.80,
      quality: {
        grade: "A",
        score: 0.80
      },
      reason: "Session low fake-out + bullish reversal"
    };
  }

  return {
    status: "WAIT",
    reason: "No valid session fake-out detected"
  };
};
