const Review = require('../model/review.js')
const Product = require('../model/productModel.js')

module.exports = async function (ProductId) {
    const productReviews = await Review.find({ Product: ProductId })
    let totalRating = 0
    productReviews.forEach(productReview => {
        totalRating += productReview.rating
    });
    const product = await product.findById(ProductId)
    product.avgRating = Math.ceil(totalRating / productReviews.length)
    product.save()
}