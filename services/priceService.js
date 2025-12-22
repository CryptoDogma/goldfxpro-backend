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

module.exports = { getGoldPrice };
