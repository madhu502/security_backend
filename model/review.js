// // const mongoose = require("mongoose")

// // const reviewSchema = mongoose.Schema({
// //     // User ID
// //     user: {
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: "User"
// //     },
// //     // Recipe ID
// //     productId: {
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: "prductId"
// //     },
// //     date: {
// //         type: Date,
// //         default: Date.now
// //     },
// //     // Rating Range 1-5
// //     rating: {
// //         type: Number,
// //         min: 1,
// //         max: 5
// //     },
// //     review: {
// //         type: String
// //     }
// // })

// // module.exports = mongoose.model("Review", reviewSchema)

// const mongoose = require('mongoose');

// const ReviewSchema = new mongoose.Schema({
//     productId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'products',
//         required: true
//     },
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'users',
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
//         default: Date.now
//     }
// });

// const Review = mongoose.model('Review', ReviewSchema);
// module.exports = Review;

const mongoose = require("mongoose")

const reviewratingSchema = mongoose.Schema({
    userID: {
        type: String,
        required: true,
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
    },
    review: {
        type: String,
        maxLenght: 500,
        default: null,
        required: false,

    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: false,

    },
    
}
)

const ReviewRating = mongoose.model('reviewrating', reviewratingSchema);
module.exports = ReviewRating;