const { runAllStrategies } = require("./engine/strategyRunner");

function startScheduler() {
  console.log("📅 Strategy scheduler started (5 min)");

  // run immediately
  runAllStrategies().catch(console.error);

  // every 5 minutes
  setInterval(() => {
    runAllStrategies().catch(console.error);
  }, 5 * 60 * 1000);
}

module.exports = { startScheduler };
