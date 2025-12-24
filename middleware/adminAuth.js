/**
 * adminAuth.js
 * Protect admin-only routes using x-admin-secret
 */

module.exports = (req, res, next) => {
  const secret = req.headers["x-admin-secret"];

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.sendStatus(401);
  }

  next();
};
