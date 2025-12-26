const runV1 = require("./v1");
const runV2 = require("./v2");
const runV3 = require("./v3");
const runV4 = require("./v4");
const runV5 = require("./v5");

async function runStrategy(version, context) {
  switch (version) {
    case "v1": return runV1(context);
    case "v2": return runV2(context);
    case "v3": return runV3(context);
    case "v4": return runV4(context);
    case "v5": return runV5(context);
    default:
      return { status: "WAIT", reason: "Unknown strategy" };
  }
}

module.exports = { runStrategy };
