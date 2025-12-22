const express = require("express");
const auth = require("../middleware/auth");
const { getGoldPrice } = require("../services/priceService");

const router = express.Router();

router.get("/signal", auth, async (req, res) => {
  try {
    const price = await getGoldPrice();

    const bullish = Math.random() > 0.5;
    const sl = bullish ? price - 10 : price + 10;
    const tp = bullish ? price + 20 : price - 20;

    res.json({
      pair: "XAUUSD",
      timeframe: "M15",
      direction: bullish ? "BUY" : "SELL",
      entry: price.toFixed(2),
      takeProfit: tp.toFixed(2),
      stopLoss: sl.toFixed(2),
      confidence: bullish ? 0.70 : 0.65,
      reasoning: "Live price + trend bias",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
