const router = require("express").Router();
const cartController = require("../controller/cartController.js");
const { authGuard } = require("../middleware/auth.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// create favorite API
// router.post(
//   "/addToCart",
//   authGuard,
//   // upload.single("productImage"),
//   cartController.addToCart
// ); // Use upload.single() for single file
router.post("/addToCart", authGuard, cartController.addToCart);
router.get("/getCartByUserID/:id", authGuard, cartController.getCartByUserID);
router.put("/updateCart/:id", authGuard, cartController.updateCart);
router.delete("/removeFromCart/:id", authGuard, cartController.removeFromCart);
router.put("/status", authGuard, cartController.updateUserCartStatus);

module.exports = router;
