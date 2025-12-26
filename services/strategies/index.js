const runV1 = require("./v1");
const runV2 = require("./v2");
const runV3 = require("./v3");
const runV4 = require("./v4");

async function runStrategy(strategy, context) {
  switch (strategy) {
    case "v1":
      return await runV1(context);
    case "v2":
      return await runV2(context);
    case "v3":
      return runV3(context);
    case "v4":
      return runV4(context);
    default:
      return {
        status: "WAIT",
        reason: "Unknown strategy"
      };
  }
}

module.exports = { runStrategy };
