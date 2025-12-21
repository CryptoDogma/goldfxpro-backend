const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../utils/fileDb");
const { generateLicenseKey } = require("../utils/keygen");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password, activationCode } = req.body;

  const activationKeys = db.read("activationKeys.json");
  const code = activationKeys.find(k => k.code === activationCode && !k.used);

  if (!code) {
    return res.status(400).json({ error: "Invalid activation code" });
  }

  code.used = true;
  db.write("activationKeys.json", activationKeys);

  const users = db.read("users.json");

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }

  const license = generateLicenseKey();

  users.push({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    license
  });

  db.write("users.json", users);

  res.json({ license });
});

module.exports = router;
