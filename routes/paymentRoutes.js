const express = require('express');
const router = express.Router();
const { createPaymentIntent, sendOrderConfirmation, getUserOrders, cancelUserOrder } = require('../controllers/paymentController');
const auth = require('../middleware/authMiddleware');

// POST /api/payment/create-intent
router.post('/create-intent', createPaymentIntent);

// POST /api/payment/send-receipt
router.post('/send-receipt', sendOrderConfirmation);

// GET /api/payment/my-orders
router.get('/my-orders', auth, getUserOrders);

// PUT /api/payment/my-orders/:id/cancel
router.put('/my-orders/:id/cancel', auth, cancelUserOrder);

module.exports = router;
