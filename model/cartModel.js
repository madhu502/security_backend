const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    productID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products", // Reference to the Product model
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"], // Limit possible values
      default: "active",
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: "Quantity must be greater than 0.",
      },
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Add an index to prevent duplicate cart items for the same user and product
cartSchema.index({ userID: 1, productID: 1 }, { unique: true });

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
// exporting customer from db
// const Cart = mongoose.model("Cart", cartSchema);

// module.exports = Cart;

// const mongoose = require('mongoose');
// const cartSchema = mongoose.Schema({
//     userID: {
//         type: String,
//         required: true,
//     },
//     productID: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'products',
//         required: true,
//     },
//     status: {
//         type: String,
//         default: "active"
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
//     quantity: {
//         type: Number,
//         required: true,
//         default: 0,
//     },

// });

// const Cart = mongoose.model('Cart', cartSchema);
// module.exports = Cart;
