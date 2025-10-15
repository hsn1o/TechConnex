import jwt from "jsonwebtoken";

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

// Socket.IO authentication middleware (updated)
export const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    console.log("❌ No token provided in socket handshake");
    return next(new Error("No token provided"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ Invalid token");
      return next(new Error("Invalid token"));
    }

    socket.user = decoded;
    next();
  });
}

export { authenticateToken, authorizeRoles };
