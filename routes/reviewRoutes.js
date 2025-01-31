
const router = require('express').Router()
const reviewController = require("../controller/reviewController");
const { authGuard } = require('../middleware/auth.js');

// create favorite API
router.post('/addReview', authGuard, reviewController.createRating)
router.put('/updateReview/:id', authGuard, reviewController.updateRating)
router.get('/getReviewsByUserID/:id', reviewController.getReviewsByUserID)
router.get('/getReviewsByProductID/:id', reviewController.getReviewsByProductID)
module.exports = router;