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

  if (!candles || candles.length < 20) {
    return {
      status: "WAIT",
      reason: "Insufficient candle data"
    };
  }

  // ─────────────────────────────────────────────
  // 1️⃣ Session first candle
  const sessionData = getSessionLevels(candles, session);

  if (!sessionData || !sessionData.firstCandle) {
    return {
      status: "WAIT",
      reason: "Session candle not available"
    };
  }

  const {
    sessionHigh,
    sessionLow
  } = sessionData;

  const sessionRange = sessionHigh - sessionLow;

  // ─────────────────────────────────────────────
  // 2️⃣ ATR context (20%)
  const dailyATR = getDailyATR(candles);
  if (!dailyATR) {
    return {
      status: "WAIT",
      reason: "ATR unavailable"
    };
  }

  if (sessionRange < dailyATR * 0.20) {
    return {
      status: "WAIT",
      reason: "Session range too small vs ATR"
    };
  }

  // ─────────────────────────────────────────────
  // 3️⃣ Fake-out logic
  const lastClose = candles[candles.length - 1].close;

  const fakeBreakHigh =
    price > sessionHigh &&
    lastClose < sessionHigh;

  const fakeBreakLow =
    price < sessionLow &&
    lastClose > sessionLow;

  // ─────────────────────────────────────────────
  // 4️⃣ Reversal candle
  const reversal = detectReversalCandle(candles);
  if (!reversal) {
    return {
      status: "WAIT",
      reason: "No reversal candle"
    };
  }

  // ─────────────────────────────────────────────
  // 🔴 SELL SETUP
  if (fakeBreakHigh && reversal.type === "bearish") {
    return {
      status: "TRADE",
      bias: "SELL",
      stopLoss: sessionHigh,
      takeProfit: sessionHigh - sessionRange * 0.5,
      confidence: 0.80,
      quality: {
        grade: "A",
        score: 0.80
      },
      reason: "Session high fake-out + bearish rejection"
    };
  }

  // ─────────────────────────────────────────────
  // 🟢 BUY SETUP
  if (fakeBreakLow && reversal.type === "bullish") {
    return {
      status: "TRADE",
      bias: "BUY",
      stopLoss: sessionLow,
      takeProfit: sessionLow + sessionRange * 0.5,
      confidence: 0.80,
      quality: {
        grade: "A",
        score: 0.80
      },
      reason: "Session low fake-out + bullish rejection"
    };
  }

  return {
    status: "WAIT",
    reason: "No valid session fake-out"
  };
};
