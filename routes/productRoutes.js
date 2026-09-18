const express = require('express');
const router = express.Router();
const { 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    getAllProducts, 
    getProductById,
    getProductRecommendations
} = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// @route   POST api/products
// @desc    Create a product
// @access  Private/Admin
router.post('/', auth, admin, createProduct);

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', auth, admin, updateProduct);

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', auth, admin, deleteProduct);

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', getAllProducts);

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', getProductById);

// @route   GET api/products/:id/recommendations
// @desc    Get product recommendations
// @access  Public
router.get('/:id/recommendations', getProductRecommendations);

module.exports = router;
