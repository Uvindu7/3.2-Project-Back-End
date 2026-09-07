const User = require('../entities/User');
const Review = require('../entities/Review');
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

module.exports = {
  getAllUsers,
  deleteUser,
  getAllReviews
};
