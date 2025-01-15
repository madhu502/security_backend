const mongoose = require('mongoose');
const { type } = require('os');
const Review = require('./review');



const ProductSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    productPrice: {
        type: Number,
        required: true,
    },
    productCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true,
    },
    productDescription: {
        type: String,
        required: true,
        maxLength: 500
    },
    productImage: {
        type: String,
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const Product = mongoose.model('products', ProductSchema)

module.exports = Product;

// const mongoose = require('mongoose');

// const ReviewSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     rating: {
//         type: Number,
//         required: true,
//         min: 1,
//         max: 5
//     },
//     comment: {
//         type: String,
//         required: true
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now()
//     }
// });

// const ProductSchema = new mongoose.Schema({
//     productName: {
//         type: String,
//         required: true,
//     },
//     productPrice: {
//         type: Number,
//         required: true,
//     },
//     productCategory: {
//         type: String,
//         required: true,
//     },
//     productDescription: {
//         type: String,
//         required: true,
//         maxLength: 500
//     },
//     productImage: {
//         type: String,
//         required: true,
//     },
//     reviews: [ReviewSchema],
//     averageRating: {
//         type: Number,
//         default: 0
//     },
//     totalRatings: {
//         type: Number,
//         default: 0
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now()
//     }
// });

// const Product = mongoose.model('products', ProductSchema);

// module.exports = Product;
