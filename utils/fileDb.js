const fs = require("fs");
const path = require("path");

const BASE_PATH = process.env.RENDER
  ? "/data"
  : path.join(__dirname, "..", "data");

function ensureFile(file) {
  const filePath = path.join(BASE_PATH, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
  }
}

function read(file) {
  ensureFile(file);
  return JSON.parse(fs.readFileSync(path.join(BASE_PATH, file), "utf8"));
}

function write(file, data) {
  ensureFile(file);
  fs.writeFileSync(
    path.join(BASE_PATH, file),
    JSON.stringify(data, null, 2)
  );
}

module.exports = { read, write };
