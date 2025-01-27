const User = require('../model/userModel');
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            res.status(401);
            throw new Error('Not authorized, no token');
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("decoded", decoded);
        // Get user from database
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            res.status(401);
            throw new Error('User not found');
        }
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
            res.status(401);
            throw new Error('Token has expired');
        }

        req.user = user;
        next();

    } catch (error) {

        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'Invalid token' });
        } else {
            res.status(401).json({ message: error.message || 'Not authorized' });
        }
    }
};
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(401).json({ message: 'Not authorized as an admin' });
};

module.exports = { protect, isAdmin };