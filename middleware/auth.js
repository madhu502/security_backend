const jwt = require("jsonwebtoken");

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

module.exports = {
    authGuard,
    adminGuard
}