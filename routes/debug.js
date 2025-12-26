const express = require("express");
const { getGoldPrice, getGoldCandles } = require("../services/priceService");

const router = express.Router();

router.get("/twelvedata-check", async (req, res) => {
  try {
    const price = await getGoldPrice();
    const candles = await getGoldCandles("15min", 10);

    res.json({
      price,
      candleSample: candles,
      candleCount: candles.length,
      fieldsPresent: candles.every(c =>
        ["open","high","low","close"].every(k => typeof c[k] === "number")
      )
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
