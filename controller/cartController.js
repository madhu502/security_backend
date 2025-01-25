const Cart = require("../model/cartModel");

// Add to Cart
const addToCart = async (req, res) => {
  const id = req.user.id; // Authenticated user's ID
  const { productID, quantity } = req.body;

  if (!productID || !quantity) {
    return res.status(400).json({
      success: false,
      message: "Product ID and quantity are required.",
    });
  }

  try {
    const existingInCart = await Cart.findOne({
      userID: id,
      productID: productID,
      status: "active",
    });

    if (existingInCart) {
      existingInCart.quantity += parseInt(quantity, 10);
      await existingInCart.save();

      return res.status(200).json({
        success: true,
        message: "Quantity updated for existing cart item.",
        data: existingInCart,
      });
    }

    const newCart = new Cart({
      userID: id,
      productID: productID,
      quantity: parseInt(quantity, 10),
    });

    await newCart.save();

    res.status(201).json({
      success: true,
      message: "Product added to cart successfully.",
      data: newCart,
    });
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Get Cart by User ID
const getCartByUserID = async (req, res) => {
  const id = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  try {
    const cart = await Cart.find({ userID: id, status: "active" })
      .populate(
        "productID",
        "productName productPrice productCategory productDescription productImage"
      )
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    if (cart.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully.",
      cart,
    });
  } catch (error) {
    console.error("Error in getCartByUserID:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Update Cart
const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid number greater than zero.",
      });
    }

    const cartItem = await Cart.findById(id);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully.",
      data: cartItem,
    });
  } catch (error) {
    console.error("Error in updateCart:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Remove from Cart
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await Cart.findById(id);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    await Cart.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully.",
    });
  } catch (error) {
    console.error("Error in removeFromCart:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Update Cart Status
const updateUserCartStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.body;

    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values are 'active' or 'inactive'.",
      });
    }

    const updatedCart = await Cart.updateMany({ userID: userId }, { status });

    res.status(200).json({
      success: true,
      message: "Cart status updated successfully.",
      updatedCart,
    });
  } catch (error) {
    console.error("Error in updateUserCartStatus:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

module.exports = {
  addToCart,
  getCartByUserID,
  updateCart,
  removeFromCart,
  updateUserCartStatus,
};
