const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/sequelize');
const User = require('./User');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'product_id',
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
}, {
  tableName: 'reviews',
  timestamps: false,
});

// Setup relationships
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });

module.exports = Review;
