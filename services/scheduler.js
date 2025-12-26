/**
 * scheduler.js
 * Runs strategy engine on interval
 */

const cron = require("node-cron");
const { runAllStrategies } = require("./engine/strategyRunner");

function startScheduler() {
  console.log("[SCHEDULER] Strategy scheduler started");

  // Run immediately on boot
  runAllStrategies();

  // Every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("[SCHEDULER] Running strategy engine");
    await runAllStrategies();
  });
}

module.exports = { startScheduler };
