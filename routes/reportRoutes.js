const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.get('/sales', auth, admin, reportController.getSalesMetrics);
router.get('/inventory', auth, admin, reportController.getInventoryMetrics);
router.get('/top-products', auth, admin, reportController.getTopProducts);
router.get('/export/pdf', auth, admin, reportController.generatePDFReport);

module.exports = router;
