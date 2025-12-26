async function probeMarketData() {
  const price = await getGoldPrice();
  const m15 = await getGoldCandles("15min", 1);
  const m5  = await getGoldCandles("5min", 1);

  console.log("🔎 Data Probe");
  console.log("Price:", price);
  console.log("M15 last close:", m15[0].close);
  console.log("M5 last close:", m5[0].close);
}

module.exports = { probeMarketData };
