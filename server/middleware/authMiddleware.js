const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("Auth Middleware: No token provided in headers");
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    console.error("Auth Middleware: Token verification error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware };
