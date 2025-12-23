const db = require("../utils/fileDb");

function getActiveStrategy() {
  const config = db.read("config.json");

  if (
    !config ||
    typeof config !== "object" ||
    !config.activeStrategy
  ) {
    return "v1";
  }

  return config.activeStrategy;
}

function setActiveStrategy(strategy) {
  const config = db.read("config.json") || {};
  config.activeStrategy = strategy;
  config.updatedAt = new Date().toISOString();
  db.write("config.json", config);
  return config.activeStrategy;
}

module.exports = {
  getActiveStrategy,
  setActiveStrategy
};
