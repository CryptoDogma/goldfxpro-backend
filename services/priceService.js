/**
 * priceService.js
 * TwelveData Gold (XAU/USD) price + candles (MTF ready)
 */

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const API_KEY = process.env.TWELVE_DATA_KEY;
const SYMBOL = "XAU/USD";

/**
 * Fetch current gold price
 */
async function getGoldPrice() {
  const res = await fetch(
    `https://api.twelvedata.com/price?symbol=${SYMBOL}&apikey=${API_KEY}`
  );

  const data = await res.json();

  if (!data.price) {
    console.error("Price API response:", data);
    throw new Error("Failed to fetch gold price");
  }

  return parseFloat(data.price);
}

/**
 * Generic candle fetcher
 * @param {string} interval - e.g. "15min", "5min", "1h"
 * @param {number} outputSize
 */
async function getGoldCandles(interval = "15min", outputSize = 220) {
  const res = await fetch(
    `https://api.twelvedata.com/time_series?symbol=${SYMBOL}&interval=${interval}&outputsize=${outputSize}&apikey=${API_KEY}`
  );

  const data = await res.json();

  if (!data.values || !Array.isArray(data.values)) {
    console.error("TwelveData candle response:", data);
    throw new Error("Failed to fetch candle data");
  }

  // Oldest → newest, OHLC format
  return data.values
    .reverse()
    .map(c => ({
      open: parseFloat(c.open),
      high: parseFloat(c.high),
      low: parseFloat(c.low),
      close: parseFloat(c.close)
    }));
}

/**
 * M15 candles (default strategy timeframe)
 */
async function getGoldCandlesM15() {
  return getGoldCandles("15min", 220);
}

/**
 * M5 candles (Strategy v5 refinement / scalping)
 */
async function getGoldCandlesM5() {
  return getGoldCandles("5min", 300);
}

/**
 * H1 candles (Strategy v2 HTF bias)
 */
async function getGoldCandlesH1() {
  return getGoldCandles("1h", 220);
}

module.exports = {
  getGoldPrice,
  getGoldCandles,
  getGoldCandlesM15,
  getGoldCandlesM5,
  getGoldCandlesH1
};
