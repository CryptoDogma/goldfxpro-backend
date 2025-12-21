const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../utils/fileDb");
const { JWT_SECRET } = require("../config");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password, license } = req.body;

  const users = db.read("users.json");
  const user = users.find(u => u.email === email);

  if (!user) return res.sendStatus(401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid || user.license !== license) {
    return res.sendStatus(401);
  }

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "8h" });
  res.json({ token });
});

module.exports = router;
