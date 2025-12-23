const db = require("../utils/fileDb");

let activeStrategy = "v1";

// Load once at boot
try {
  const config = db.read("config.json");
  if (config && config.activeStrategy) {
    activeStrategy = config.activeStrategy;
  }
} catch {
  activeStrategy = "v1";
}

function getStrategy() {
  return activeStrategy;
}

function setStrategy(strategy) {
  activeStrategy = strategy;

  // Persist as backup
  const config = db.read("config.json") || {};
  config.activeStrategy = strategy;
  config.updatedAt = new Date().toISOString();
  db.write("config.json", config);

  return activeStrategy;
}

module.exports = {
  getStrategy,
  setStrategy
};
