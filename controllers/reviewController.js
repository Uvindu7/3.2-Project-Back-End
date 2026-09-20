const Review = require('../entities/Review');
const User = require('../entities/User');

// @route   GET api/reviews
// @desc    Get all reviews for a product
// @access  Public
const getReviews = async (req, res) => {
  const { productId } = req.query;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID parameter is required' });
  }

  try {
    const reviews = await Review.findAll({
      where: { productId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
        },
      ],
      order: [['id', 'DESC']],
    });

    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err.message);
    res.status(500).send('Server error');
  }
};

// @route   POST api/reviews
// @desc    Create a review (registered users only)
// @access  Private
const createReview = async (req, res) => {
  const { productId, rating, comment } = req.body;

  // Simple validation
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
  }
  if (!comment || comment.trim() === '') {
    return res.status(400).json({ message: 'Comment is required' });
  }

  try {
    // Get user to check email against orders
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const Order = require('../entities/Order');
    const orders = await Order.findAll({ where: { email: user.email } });
    
    let hasPurchased = false;
    for (const order of orders) {
      if (order.items && Array.isArray(order.items)) {
        // Items in JSON array have 'id' matching the productId
        const itemExists = order.items.find(item => item.id === productId);
        if (itemExists) {
          hasPurchased = true;
          break;
        }
      }
    }

    if (!hasPurchased) {
      return res.status(403).json({ message: 'You can only review products that you have purchased.' });
    }

    // Save review in database
    const newReview = await Review.create({
      productId,
      userId: req.user.id, // Set user ID from authorized token payload
      rating: parseInt(rating),
      comment: comment.trim(),
    });

    // Retrieve full object with user representation to send back to client
    const reviewWithUser = await Review.findByPk(newReview.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    res.status(201).json(reviewWithUser);
  } catch (err) {
    console.error('Error creating review:', err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getReviews,
  createReview,
};
