const router = require("express").Router();

const orderController = require("../controller/orderController.js");
const { authGuard } = require("../middleware/auth.js");

router.post("/create", authGuard, orderController.addOrder);
router.get("/get", authGuard, orderController.getAllOrders);
router.put("/update/:id", authGuard, orderController.updateOrderStatus);
router.get("/user", authGuard, orderController.getUserOrders);
module.exports = router;