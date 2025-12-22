/**
 * priceService.js
 * Fetches live XAUUSD (Gold) price from TwelveData
 * API key is read from Render environment variables
 */

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const API_KEY = process.env.TWELVE_DATA_KEY;

async function getGoldPrice() {
  if (!API_KEY) {
    throw new Error("TWELVE_DATA_KEY not set");
  }

  const url = `https://api.twelvedata.com/price?symbol=XAU/USD&apikey=${API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data || !data.price) {
    throw new Error("Failed to fetch gold price from TwelveData");
  }

  return parseFloat(data.price);
}

module.exports = {
  getGoldPrice
};
