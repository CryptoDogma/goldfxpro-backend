const fs = require("fs");
const path = require("path");

// Render persistent disk
const BASE_PATH = process.env.RENDER
  ? "/data"
  : path.join(__dirname, "..", "data");

function read(file) {
  const filePath = path.join(BASE_PATH, file);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function write(file, data) {
  const filePath = path.join(BASE_PATH, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { read, write };
