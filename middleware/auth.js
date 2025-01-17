const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).json({
      success: false,
      message: "Auth Header not found!",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token || token === "") {
    return res.status(400).json({
      success: false,
      message: "Token not found!",
    });
  }

  try {
    const decodedUserData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedUserData;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again!",
      });
    }
    res.status(400).json({
      success: false,
      message: "Invalid token. Not Authenticated!",
    });
  }
};

// Auth Guard
const authGuard = (req, res, next) => {
  verifyToken(req, res, next);
};

// Admin Guard
const adminGuard = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin === false) {
      return res.status(400).json({
        success: false,
        message: "Permission Denied!",
      });
    }
    next();
  });
};

module.exports = {
  authGuard,
  adminGuard,
};
