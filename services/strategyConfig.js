const db = require("../utils/fileDb");

let activeStrategy = "v1";

// Load once at startup
try {
  const config = db.read("config.json");
  if (config && config.activeStrategy) {
    activeStrategy = config.activeStrategy;
  }
} catch (e) {
  activeStrategy = "v1";
}

function getActiveStrategy() {
  return activeStrategy;
}

function setActiveStrategy(strategy) {
  activeStrategy = strategy;

  // persist as backup
  const config = db.read("config.json") || {};
  config.activeStrategy = strategy;
  config.updatedAt = new Date().toISOString();
  db.write("config.json", config);

  console.log("✅ Active strategy set to:", strategy);
  return activeStrategy;
}

module.exports = {
  getActiveStrategy,
  setActiveStrategy
};
