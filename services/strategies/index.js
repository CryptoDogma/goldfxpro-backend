const { runV1 } = require("./v1");
const { runV2 } = require("./v2");
const { runV3 } = require("./v3");

async function runStrategy(version, context) {
  switch (version) {
    case "v1":
      return runV1(context);
    case "v2":
      return runV2(context);
    case "v3":
      return runV3(context);
    default:
      return {
        status: "WAIT",
        reason: "Unknown strategy version"
      };
  }
}

module.exports = { runStrategy };
