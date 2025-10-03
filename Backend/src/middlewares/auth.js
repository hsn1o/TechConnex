// src/middlewares/auth.js
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    // payload.roles should be an array
    req.user = payload;
    if (!Array.isArray(req.user.roles)) {
      // backward compat: convert single role string to array
      req.user.roles = req.user.role ? [req.user.role] : [];
    }
    next();
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    const ok = allowedRoles.some(r => roles.includes(r));
    if (!ok) return res.status(403).json({ message: "Access denied" });
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
