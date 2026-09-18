const express = require('express');
const router = express.Router();
const { createCategory, getAllCategories } = require('../controllers/categoryController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// @route   POST api/categories
// @desc    Create a category
// @access  Private/Admin
router.post('/', auth, admin, createCategory);

// @route   GET api/categories
// @desc    Get all categories
// @access  Public
router.get('/', getAllCategories);

module.exports = router;
