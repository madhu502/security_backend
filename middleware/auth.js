const jwt = require("jsonwebtoken");
const User = require('../model/userModel');
const authGuard = (req, res, next) => {
    // check incomming Data
    console.log(req.headers)

    // get authorization data from headers
    const authHeader = req.headers.authorization;

    // check or validate 
    if (!authHeader) {
        return res.status(400).json({
            succcess: false,
            message: "Auth Header not found!"
        })
    }
    // split the data(format: 'Bearer token-fghjk')- only token
    const token = authHeader.split(' ')[1]

    // if token not found stop the process (res)
    if (!token || token === "") {
        return res.status(400).json({
            succcess: false,
            message: "Token not found!"
        })
    }
    // verify
    try {
        const decodeUserData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodeUserData;
        next()

    } catch (error) {
        console.log(error)
        res.status(400).json({
            success: false,
            message: "Not Authenticated!"
        })
    }
    // if verified :next (function in controller)
    // not verifird :cot auth

}

// Admin Guard 
const adminGuard = (req, res, next) => {
    // check incomming Data
    console.log(req.headers)

    // get authorization data from headers
    const authHeader = req.headers.authorization;

    // check or validate 
    if (!authHeader) {
        return res.status(400).json({
            succcess: false,
            message: "Auth Header not found!"
        })
    }
    // split the data(format: 'Bearer token-fghjk')- only token
    const token = authHeader.split(' ')[1]

    // if token not found stop the process (res)
    if (!token || token === "") {
        return res.status(400).json({
            succcess: false,
            message: "Token not found!"
        })
    }
    // verify
    try {
        const decodeUserData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodeUserData; // user info :id and isAdmin
        if (req.user.isAdmin === false) {
            return res.status(400).json({
                success: false,
                message: "Permission Delined!"
            })
        }
        next()

    } catch (error) {
        console.log(error)
        res.status(400).json({
            success: false,
            message: "Not Authenticated!"
        })
    }

}
const checkAccountLockout = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && user.isLocked) {
            return res.json({
                success: false,
                message: "Account is locked. Please try again later.",
            });
        }
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Server error." });
    }
};

const checkPasswordExpiry = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: "User not found.",
            });
        }
        const passwordAge =
            (new Date() - new Date(user.passwordChangedAt)) / (1000 * 60 * 60 * 24); // in days
        if (passwordAge > 90) {
            return res.json({
                success: false,
                message: "Password has expired. Please reset your password.",
            });
        }
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Server error." });
    }
};
const validatePasswordStrength = (req, res, next) => {
    const { password } = req.body;

    const strength = assessPasswordStrength(password);
    if (strength === "Weak") {
        return res.json({
            success: false,
            message: "Password is too weak. Please choose a stronger password.",
        });
    }
    next();
};
const assessPasswordStrength = (password) => {
    const strength = {
        0: "Weak",
        1: "Fair",
        2: "Good",
        3: "Strong",
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
    adminGuard,
    checkAccountLockout,
    checkPasswordExpiry,
    validatePasswordStrength,
    assessPasswordStrength
}