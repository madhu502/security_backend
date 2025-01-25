const express = require("express");
const { authGuard } = require("../middleware/auth");
const {
  addToCart,
  getCartByUserID,
  updateCart,
  removeFromCart,
  updateUserCartStatus,
} = require("../controller/cartController");

const router = express.Router();

// Add to cart
router.post("/addToCart", authGuard, addToCart);

// Get cart by user ID
router.get("/getCartByUserID", authGuard, getCartByUserID);

// Update cart item
router.put("/updateCart/:id", authGuard, updateCart);

// Remove item from cart
router.delete("/removeFromCart/:id", authGuard, removeFromCart);

// Update cart status
router.put("/updateCartStatus", authGuard, updateUserCartStatus);

module.exports = router;
