const { runV1 } = require("./v1Strategy");
const { runV2 } = require("./v2Strategy");
const { runV3 } = require("./v3Strategy");

async function runStrategy(version, context) {
  switch (version) {
    case "v3":
      return runV3(context);
    case "v2":
      return runV2(context);
    case "v1":
      return runV1(context);
  }
}

module.exports = { runStrategy };

