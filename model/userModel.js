const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: Number,
    },
    password: {
        type: String,
        required: true,
    },
    passwordHistory: [
        {
            type: String,
        },
    ],
    resetPasswordOTP: {
        type: Number,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now,
    },
    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: {
        type: Date,
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,


    isAdmin: {
        type: Boolean,
        default: false
    }
});
userSchema.virtual("isLocked").get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});


userSchema.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

const User = mongoose.model('users', userSchema)

module.exports = User;