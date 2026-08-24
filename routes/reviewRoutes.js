const express = require('express');
const router = express.Router();
const { getReviews, createReview } = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');

// Get all reviews for a product
router.get('/', getReviews);

// Add a review (only registered/authenticated users)
router.post('/', auth, createReview);

module.exports = router;
