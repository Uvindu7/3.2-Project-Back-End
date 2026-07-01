const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/payment/create-intent
 * Creates a Stripe PaymentIntent and returns the client_secret.
 * Body: { amount (in paise/cents), currency, items }
 */
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'lkr', items } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        items: JSON.stringify(
          items?.map((item) => ({
            id: item.id,
            name: item.name,
            qty: item.quantity,
            price: item.price,
          }))
        ),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe PaymentIntent error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPaymentIntent };
