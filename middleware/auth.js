const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

module.exports = (req, res, next) => {
  const authHeader =
    req.headers.authorization ||
    req.headers.Authorization;

  if (!authHeader) {
    return res.sendStatus(401);
  }

  // Expect: "Bearer <token>"
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.sendStatus(401);
  }

  const token = parts[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};
