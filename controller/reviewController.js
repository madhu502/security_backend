const Product = require("../model/productModel.js")

const Rating = require("../model/review.js")

const createRating = async (req, res) => {
    console.log(req.body);
    const id = req.user.id;

    // destructure data 
    const {
        userID,
        productID,
        review,
        rating,
    } = req.body;

    // validate the data 
    if (!userID || !productID) {
        return res.json({
            success: false,
            message: "Please provide all the details"
        });
    }

    // try-catch block 
    try {
        const existingRating = await Rating.findOne({
            userID: id,
            productID: productID,
        });

        if (existingRating) {
            return res.json({
                success: false,
                message: "Already Rated"
            });
        }

        // Create a new favorite entry
        const newRating = new Rating({
            userID: id,
            productID: productID,
            review: review,
            rating: rating,
        });

        // Save the new favorite
        await newRating.save();

        res.status(200).json({
            success: true,
            message: "Added to Review",
            data: newRating
        });

    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error");
    }
};

const updateRating = async (req, res) => {
    console.log(req.body);
    console.log(req.files);

    const {
        userID,
        productID,
        review,
        rating,
    } = req.body;

    const id = req.params.id;
    if (!userID
        || !productID
        || !review
        || !rating

    ) {
        return res.json({
            success: true,
            message: "All fields are required!"
        })
    }
    try {
        const updatedRating = {
            userID: userID,
            productID: productID,
            review: review,
            rating: rating,

        }
        await Rating.findByIdAndUpdate(id, updatedRating);
        res.json({
            success: true,
            message: "Rating Changed",
            rating: updatedRating
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Server Error"
        })

    }

}
const getReviewsByUserID = async (req, res) => {
    const id = req.params.id;
    try {
        const reviews = await Rating.find({ userID: id });
        console.log(reviews);
        res.json({
            message: "Reviews retrieved",
            success: true,
            review: reviews,
        });
    } catch (e) {
        console.error(e);
        res.json({
            message: "Error",
            success: false,
        });
    }
};
const getReviewsByProductID = async (req, res) => {
    const id = req.params.id;
    try {
        const reviews = await Rating.find({ productID: id });
        console.log(reviews);
        res.json({
            message: "Reviews retrieved",
            success: true,
            review: reviews,
        });
    } catch (e) {
        console.error(e);
        res.json({
            message: "Error",
            success: false,
        });
    }
};

module.exports = {
    createRating,
    updateRating,
    getReviewsByUserID,
    getReviewsByProductID

};