const fs = require("fs");
const path = require("path");

const BASE_PATH = process.env.RENDER
  ? "/data"
  : path.join(__dirname, "..", "data");

// Files that should be OBJECTS, not arrays
const OBJECT_FILES = ["config.json"];

function ensureFile(file) {
  const filePath = path.join(BASE_PATH, file);

  if (!fs.existsSync(BASE_PATH)) {
    fs.mkdirSync(BASE_PATH, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    const initial =
      OBJECT_FILES.includes(file) ? {} : [];
    fs.writeFileSync(
      filePath,
      JSON.stringify(initial, null, 2)
    );
  }
}

function read(file) {
  ensureFile(file);
  return JSON.parse(
    fs.readFileSync(path.join(BASE_PATH, file), "utf8")
  );
}

function write(file, data) {
  ensureFile(file);
  fs.writeFileSync(
    path.join(BASE_PATH, file),
    JSON.stringify(data, null, 2)
  );
}

module.exports = { read, write };
