const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(400).json({
//       success: false,
//       message: "Auth Header not found!",
//     });
//   }

//   const token = authHeader.split(" ")[1];
//   if (!token || token === "") {
//     return res.status(400).json({
//       success: false,
//       message: "Token not found!",
//     });
//   }

//   try {
//     const decodedUserData = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decodedUserData;
//     next();
//   } catch (error) {
//     console.error("JWT verification error:", error);
//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({
//         success: false,
//         message: "Token expired. Please log in again!",
//       });
//     }
//     res.status(400).json({
//       success: false,
//       message: "Invalid token. Not Authenticated!",
//     });
//   }
// };

// // Auth Guard
// const authGuard = (req, res, next) => {
//   verifyToken(req, res, next);
// };

// // Admin Guard
// const adminGuard = (req, res, next) => {
//   verifyToken(req, res, () => {
//     if (req.user.isAdmin === false) {
//       return res.status(400).json({
//         success: false,
//         message: "Permission Denied!",
//       });
//     }
//     next();
//   });
// };
const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.json({
          success: false,
          message: "Authorization header not found!"
      });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
      return res.json({
          success: false,
          message: "Token not found!"
      });
  }

  try {
      const decodeUser = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decodeUser; 
      next();
  } catch (error) {
      console.log(error);
      res.json({
          success: false,
          message: "Invalid Token"
      });
  }
};

const checkAccountLockout = async (req, res, next) => {
  const { email } = req.body;
  try {
      const user = await User.findOne({ email });
      if (user && user.isLocked) {
          return res.json({
              success: false,
              message: 'Account is locked. Please try again later.'
          });
      }
      next();
  } catch (error) {
      console.log(error);
      res.json({ success: false, message: 'Server error.' });
  }
};

const checkPasswordExpiry = async (req, res, next) => {
  const { email } = req.body;
  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.json({
              success: false,
              message: 'User not found.'
          });
      }
      const passwordAge = (new Date() - new Date(user.passwordChangedAt)) / (1000 * 60 * 60 * 24); // in days
      if (passwordAge > 90) { 
          return res.json({
              success: false,
              message: 'Password has expired. Please reset your password.'
          });
      }
      next();
  } catch (error) {
      console.log(error);
      res.json({ success: false, message: 'Server error.' });
  }
};
const validatePasswordStrength = (req, res, next) => {
  const { password } = req.body;

  const strength = assessPasswordStrength(password);
  if (strength === "Weak") {
      return res.json({
          success: false,
          message: 'Password is too weak. Please choose a stronger password.'
      });
  }
  next();
};

// Utility function to assess password strength
const assessPasswordStrength = (password) => {
  const strength = {
      0: "Weak",
      1: "Fair",
      2: "Good",
      3: "Strong"
  };
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  return strength[score > 3 ? 3 : score];
};

module.exports = {
  authGuard,
  // adminGuard,
  assessPasswordStrength,
  validatePasswordStrength,
  checkPasswordExpiry,
  checkAccountLockout
};
