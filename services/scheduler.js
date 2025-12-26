const { runAllStrategies } = require("./engine/strategyRunner");
const { resolveBestSignal } = require("./engine/signalResolver");
const db = require("../utils/fileDb");

const { sendWhatsApp } = require("./whatsappService");
const { buildTradeMessage } = require("./whatsappFormatter");

const ALLOWED_STRATEGIES = ["v3", "v4"];
const MIN_CONFIDENCE = 0.75;

function signalsEqual(a, b) {
  if (!a || !b) return false;
  return (
    a.strategy === b.strategy &&
    a.direction === b.direction &&
    a.entry === b.entry &&
    a.stopLoss === b.stopLoss &&
    a.takeProfit === b.takeProfit
  );
}

function startScheduler() {
  console.log("📅 Strategy scheduler started (5 min)");

  async function tick() {
    try {
      // 1️⃣ Run all strategies
      const results = await runAllStrategies();

      // 2️⃣ Resolve best
      const bestSignal = resolveBestSignal(results);

      if (!bestSignal) {
        db.write("currentSignal.json", {
          status: "WAIT",
          reason: "No valid trade",
          timestamp: new Date().toISOString()
        });
        console.log("⏸ WAIT — no trade");
        return;
      }

      // 3️⃣ Save current signal
      db.write("currentSignal.json", bestSignal);

      // 4️⃣ Compare with last WhatsApp send
      let lastSent = null;
      try {
        lastSent = db.read("lastSentSignal.json");
      } catch {}

      const shouldSend =
        ALLOWED_STRATEGIES.includes(bestSignal.strategy) &&
        bestSignal.confidence >= MIN_CONFIDENCE &&
        !signalsEqual(bestSignal, lastSent);

      if (!shouldSend) {
        console.log("ℹ️ Signal unchanged or not eligible for WhatsApp");
        return;
      }

      // 5️⃣ Send WhatsApp
      const users = db.read("users.json") || [];

      for (const user of users) {
        if (!user.phone || !user.whatsappOptIn) continue;

        await sendWhatsApp(
          user.phone,
          buildTradeMessage(bestSignal)
        );
      }

      // 6️⃣ Store last sent signal
      db.write("lastSentSignal.json", bestSignal);

      console.log(
        `📲 WhatsApp sent: ${bestSignal.strategy.toUpperCase()} ${bestSignal.direction}`
      );

    } catch (err) {
      console.error("Scheduler error:", err);
    }
  }

  // 🚀 Run immediately
  tick();

  // ⏱ Every 5 minutes
  setInterval(tick, 5 * 60 * 1000);
}

module.exports = { startScheduler };
