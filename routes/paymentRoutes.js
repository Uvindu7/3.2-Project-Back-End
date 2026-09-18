const express = require('express');
const router = express.Router();
const { createPaymentIntent, sendOrderConfirmation } = require('../controllers/paymentController');

// POST /api/payment/create-intent
router.post('/create-intent', createPaymentIntent);

// POST /api/payment/send-receipt
router.post('/send-receipt', sendOrderConfirmation);

module.exports = router;
