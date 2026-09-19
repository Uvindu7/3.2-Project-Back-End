const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

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

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'webp', 'jpeg']
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// @route   POST api/products
// @desc    Create a product
// @access  Private/Admin
router.post('/', auth, admin, upload.single('image'), createProduct);

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', auth, admin, upload.single('image'), updateProduct);

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
