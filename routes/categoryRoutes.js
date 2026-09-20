const express = require('express');
const router = express.Router();
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');
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

// @route   PUT api/categories/:id
// @desc    Update a category
// @access  Private/Admin
router.put('/:id', auth, admin, updateCategory);

// @route   DELETE api/categories/:id
// @desc    Delete a category
// @access  Private/Admin
router.delete('/:id', auth, admin, deleteCategory);

module.exports = router;
