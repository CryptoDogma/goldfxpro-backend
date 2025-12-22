/**
 * priceService.js
 * TwelveData Gold (XAUUSD) price + candles
 */

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const API_KEY = process.env.TWELVE_DATA_KEY;

async function getGoldPrice() {
  const res = await fetch(
    `https://api.twelvedata.com/price?symbol=XAU/USD&apikey=${API_KEY}`
  );

  const data = await res.json();

  if (!data.price) {
    throw new Error("Failed to fetch gold price");
  }

  return parseFloat(data.price);
}

async function getGoldCandles() {
  const res = await fetch(
    `https://api.twelvedata.com/time_series?symbol=XAU/USD&interval=15min&outputsize=220&apikey=${API_KEY}`
  );

  const data = await res.json();

  if (!data.values || !Array.isArray(data.values)) {
    console.error("TwelveData candle response:", data);
    throw new Error("Failed to fetch candle data");
  }

  // Oldest → newest
  return data.values.reverse().map(c => parseFloat(c.close));
}

module.exports = {
  getGoldPrice,
  getGoldCandles
};

