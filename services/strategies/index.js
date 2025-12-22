const { runV1 } = require("./v1Strategy");
const { runV2 } = require("./v2Strategy");

async function runStrategy(version, context) {
  switch (version) {
    case "v2":
      return runV2(context);
    case "v1":
    default:
      return runV1(context);
  }
}

module.exports = { runStrategy };
