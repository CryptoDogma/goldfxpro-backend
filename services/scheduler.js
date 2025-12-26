const { runAllStrategies } = require("./engine/strategyRunner");
const { resolveBestSignal } = require("./engine/signalResolver");
const db = require("./fileDb");

function startScheduler() {
  console.log("📅 Strategy scheduler started (5 min)");

  async function tick() {
    try {
      // 1️⃣ Run all strategies
      const results = await runAllStrategies();

      // 2️⃣ Pick best signal
      const bestSignal = resolveBestSignal(results);

      if (bestSignal) {
        db.write("currentSignal.json", bestSignal);
        console.log(
          `✅ Best signal: ${bestSignal.strategy.toUpperCase()} ${bestSignal.direction} (${Math.round(bestSignal.confidence * 100)}%)`
        );
      } else {
        db.write("currentSignal.json", {
          status: "WAIT",
          reason: "No valid trade from any strategy",
          timestamp: new Date().toISOString()
        });
        console.log("⏸ No valid trade — WAIT");
      }

    } catch (err) {
      console.error("Scheduler error:", err);
    }
  }

  // 🚀 run immediately
  tick();

  // ⏱ every 5 minutes
  setInterval(tick, 5 * 60 * 1000);
}

module.exports = { startScheduler };
