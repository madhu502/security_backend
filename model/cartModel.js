// const mongoose = require('mongoose');

// // creating tables for cart
// const cartSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//     },
//     productId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "productId",
//         required: true,
//     },
//     quantity: {
//         type: Number,
//         default: 1,
//     },
// });

// // exporting customer from db
// const Cart = mongoose.model("Cart", cartSchema);

// module.exports = Cart;

const mongoose = require('mongoose');
const cartSchema = mongoose.Schema({
    userID: {
        type: String,
        required: true,
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
    },
    status: {
        type: String,
        default: "active"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
    },

});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;