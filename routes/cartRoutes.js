const router = require('express').Router()
const cartController = require("../controller/cartController.js");
const { authGuard } = require('../middleware/auth.js');

// create favorite API
router.post('/addToCart', authGuard, cartController.addToCart)
router.get('/getCartByUserID/:id', authGuard, cartController.getCartByUserID)
router.put("/updateCart/:id", authGuard, cartController.updateCart)
router.delete("/removeFromCart/:id", authGuard, cartController.removeFromCart)
router.put("/status", authGuard, cartController.updateUserCartStatus)



module.exports = router;