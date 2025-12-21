const { v4: uuid } = require("uuid");

function generateLicenseKey() {
  return "GFXP-" + uuid().split("-")[0].toUpperCase();
}

function generateActivationKey() {
  return "FX-ACT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = {
  generateLicenseKey,
  generateActivationKey
};
