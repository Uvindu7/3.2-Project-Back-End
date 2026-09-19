const User = require('../entities/User');
const Review = require('../entities/Review');
const Order = require('../entities/Order');
const Product = require('../entities/Product');
const supabase = require('../configs/supabase');

// ─────────────────────────────────────────────
// Get all users
// ─────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'isAdmin', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ─────────────────────────────────────────────
// Delete a user
// ─────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error("Supabase auth delete error:", error.message);
    }

    // Delete from DB
    await user.destroy();

    res.json({ message: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ─────────────────────────────────────────────
// Get all reviews
// ─────────────────────────────────────────────
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ─────────────────────────────────────────────
// Get all orders
// ─────────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ─────────────────────────────────────────────
// Update order status
// ─────────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ─────────────────────────────────────────────
// Get Dashboard Stats
// ─────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const usersCount = await User.count();
    const reviewsCount = await Review.count();
    const productsCount = await Product.count();
    const outOfStockCount = await Product.count({ where: { stock: 0 } });
    const ordersCount = await Order.count();
    
    // Revenue calculation
    const orders = await Order.findAll({
      attributes: ['grandTotal']
    });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);

    // Recent orders
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users: usersCount,
      reviews: reviewsCount,
      products: productsCount,
      outOfStock: outOfStockCount,
      orders: ordersCount,
      totalRevenue,
      recentOrders
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getAllReviews,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats
};
