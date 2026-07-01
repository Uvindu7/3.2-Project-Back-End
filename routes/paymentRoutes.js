const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/paymentController');

// POST /api/payment/create-intent
router.post('/create-intent', createPaymentIntent);

module.exports = router;
