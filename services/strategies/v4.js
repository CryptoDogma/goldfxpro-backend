/**
 * Strategy v4
 * Session Range Fake-out + ATR Context
 */

const { getSessionLevels } = require("../session/sessionLevels");
const { detectReversalCandle } = require("../candles/reversal");
const { getDailyATR } = require("../volatility/atr");

module.exports = function runV4(context) {
  const { candles, session, price } = context;

  if (!candles || candles.length < 30) {
    return {
      status: "WAIT",
      reason: "Insufficient candle data"
    };
  }

  // ─────────────────────────────────────────────
  // 1️⃣ FIRST SESSION CANDLE (CRITICAL)
  const sessionData = getSessionLevels(candles, session);

  if (!sessionData || !sessionData.firstCandle) {
    return {
      status: "WAIT",
      reason: "Session not active"
    };
  }

  const first = sessionData.firstCandle;
  const firstHigh = first.high;
  const firstLow = first.low;
  const firstRange = firstHigh - firstLow;

  // ─────────────────────────────────────────────
  // 2️⃣ ATR CONTEXT (20%)
  const dailyATR = getDailyATR(candles);
  if (!dailyATR) {
    return {
      status: "WAIT",
      reason: "ATR unavailable"
    };
  }

  if (firstRange < dailyATR * 0.20) {
    return {
      status: "WAIT",
      reason: "First session candle too small vs ATR"
    };
  }

  // ─────────────────────────────────────────────
  // 3️⃣ FAKE-OUT LOGIC (BREAK + CLOSE BACK IN)
  const lastCandle = candles[candles.length - 1];
  const lastClose = lastCandle.close;

  const fakeBreakHigh =
    price > firstHigh &&
    lastClose < firstHigh;

  const fakeBreakLow =
    price < firstLow &&
    lastClose > firstLow;

  // ─────────────────────────────────────────────
  // 4️⃣ REVERSAL CONFIRMATION
  const reversal = detectReversalCandle(candles);
  if (!reversal) {
    return {
      status: "WAIT",
      reason: "Waiting for reversal confirmation"
    };
  }

  const midpoint = (firstHigh + firstLow) / 2;

  // ─────────────────────────────────────────────
  // 🔴 SELL SETUP
  if (fakeBreakHigh && reversal.type === "bearish") {
    return {
      status: "TRADE",
      bias: "SELL",
      stopLoss: firstHigh,
      takeProfit: midpoint,
      confidence: 0.82,
      quality: {
        grade: "A+",
        score: 0.82
      },
      reason:
        "Session high fake-out + ATR expansion + bearish rejection"
    };
  }

  // ─────────────────────────────────────────────
  // 🟢 BUY SETUP
  if (fakeBreakLow && reversal.type === "bullish") {
    return {
      status: "TRADE",
      bias: "BUY",
      stopLoss: firstLow,
      takeProfit: midpoint,
      confidence: 0.82,
      quality: {
        grade: "A+",
        score: 0.82
      },
      reason:
        "Session low fake-out + ATR expansion + bullish rejection"
    };
  }

  // ─────────────────────────────────────────────
  return {
    status: "WAIT",
    reason: "No valid session fake-out"
  };
};
