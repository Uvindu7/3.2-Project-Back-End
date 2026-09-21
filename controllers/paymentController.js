const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

const sendEmail = require('../services/emailService');
const { Order, Product } = require('../entities');

const sendOrderConfirmation = async (req, res) => {
  try {
    const { email, billing, items, grandTotal, transactionId } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} x ${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-w-lg margin: auto;">
        <h2 style="color: #111;">Order Confirmed! 🎉</h2>
        <p>Thank you for shopping at LIYARA Clothing. Your payment has been received successfully.</p>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 10px; background: #f9f9f9;">Item</th>
              <th style="text-align: right; padding: 10px; background: #f9f9f9;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr>
              <td style="padding: 10px; font-weight: bold; text-align: right;">Grand Total:</td>
              <td style="padding: 10px; font-weight: bold; text-align: right;">Rs ${grandTotal.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        <p style="margin-top: 20px;">We will notify you once your items are shipped.</p>
      </div>
    `;

    await sendEmail({
      email,
      subject: 'Your Order Confirmation - LIYARA Clothing',
      message: `Your order for Rs ${grandTotal} has been confirmed. Transaction ID: ${transactionId}`,
      html
    });

    // Save order to the database
    await Order.create({
      transactionId,
      email,
      firstName: billing?.firstName || null,
      lastName: billing?.lastName || null,
      address: billing?.address || null,
      city: billing?.city || null,
      postalCode: billing?.postalCode || null,
      phone: billing?.phone || null,
      grandTotal,
      items,
      status: 'Pending'
    });

    // Reduce stock for each item
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.id) {
          let stockField = 'stockM';
          if (item.size === 'S') stockField = 'stockS';
          else if (item.size === 'L') stockField = 'stockL';

          await Product.decrement(stockField, {
            by: item.quantity || 1,
            where: { id: item.id }
          });
        }
      }
    }

    res.json({ success: true, message: 'Email sent and order saved' });
  } catch (error) {
    require('fs').appendFileSync('db_error.log', `[${new Date().toISOString()}] Error saving order: ${error.message}\n${error.stack}\n`);
    console.error('Order Confirmation Email error:', error.message);
    res.status(500).json({ error: 'Failed to send confirmation email' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { User } = require('../entities');
    const user = await User.findByPk(req.user.id);
    const email = user?.email;

    if (!email) return res.status(401).json({ error: 'Unauthorized' });

    const orders = await Order.findAll({
      where: { email },
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('Fetch User Orders error:', error.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const cancelUserOrder = async (req, res) => {
  try {
    const { User, Order, Product } = require('../entities');
    const user = await User.findByPk(req.user.id);
    const email = user?.email;
    if (!email) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const order = await Order.findOne({ where: { id, email } });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'Pending') return res.status(400).json({ error: 'Only pending orders can be cancelled' });

    order.status = 'Cancelled';
    await order.save();

    // restore stock
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item.id) {
          let stockField = 'stockM';
          if (item.size === 'S') stockField = 'stockS';
          else if (item.size === 'L') stockField = 'stockL';

          await Product.increment(stockField, {
            by: item.quantity || 1,
            where: { id: item.id }
          });
        }
      }
    }

    res.json(order);
  } catch (error) {
    console.error('Cancel Order error:', error.message);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

module.exports = { createPaymentIntent, sendOrderConfirmation, getUserOrders, cancelUserOrder };
