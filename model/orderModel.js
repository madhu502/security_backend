const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    carts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
        required: true
    }],
    total: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    paymentType: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Pending"
    },  
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Order = mongoose.model("orders", orderSchema);

module.exports = Order;