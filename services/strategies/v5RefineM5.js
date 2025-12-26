const { detectReversalCandle } = require("../candles/reversal");
const { detectFVGs, priceInAnyFVG } = require("../structure/fvg");

function refineV5M5({ bias, price, candlesM5, orb }) {
  if (!candlesM5 || candlesM5.length < 20) {
    return { status: "WAIT", reason: "Not enough M5 data" };
  }

  // 1️⃣ Pullback into ORB range
  const insideORB =
    price <= orb.high && price >= orb.low;

  if (!insideORB) {
    return {
      status: "WAIT",
      reason: "Price not inside ORB range (M5 refine)"
    };
  }

  // 2️⃣ FVG confirmation
  const fvgs = detectFVGs(candlesM5);

  const inFVG =
    bias === "BUY"
      ? priceInAnyFVG(price, fvgs, "bullish")
      : priceInAnyFVG(price, fvgs, "bearish");

  // 3️⃣ Reversal candle
  const reversal = detectReversalCandle(candlesM5);

  if (!inFVG || !reversal) {
    return {
      status: "WAIT",
      reason: "Waiting for M5 SMC confirmation"
    };
  }

  // ✅ CONFIRMED ENTRY
  return {
    status: "TRADE",
    bias,
    confidence: 0.88,
    quality: { grade: "A+", score: 0.88 },
    reason: "v5 M5 refinement: ORB pullback + FVG + reversal",
    stopLoss:
      bias === "BUY"
        ? candlesM5[candlesM5.length - 1].low
        : candlesM5[candlesM5.length - 1].high,
    takeProfit:
      bias === "BUY"
        ? price + (price - candlesM5[candlesM5.length - 1].low) * 2
        : price - (candlesM5[candlesM5.length - 1].high - price) * 2
  };
}

module.exports = { refineV5M5 };
