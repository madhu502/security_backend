const express = require("express");
const { getLogs } = require("../controller/logController");
const { protect, isAdmin } = require("../middleware/authMiddlewares.js");

const router = express.Router();

// Protect all routes and require admin access
router.use(protect);
router.use(isAdmin);

router.get("/", getLogs);

module.exports = router;
