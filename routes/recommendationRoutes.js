const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const {
  getAllRecommendations,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation
} = require('../controllers/recommendationController');

const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'recommendations',
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

router.get('/', getAllRecommendations);
router.post('/', auth, admin, upload.single('image'), createRecommendation);
router.put('/:id', auth, admin, upload.single('image'), updateRecommendation);
router.delete('/:id', auth, admin, deleteRecommendation);

module.exports = router;
