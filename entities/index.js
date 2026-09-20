const sequelize = require('../configs/database');
const User = require('./User');
const Review = require('./Review');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const RecommendationItem = require('./RecommendationItem');

// Define Relationships

// A Category has many Products
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });



module.exports = {
  User,
  Review,
  Category,
  Product,
  Order,
  RecommendationItem
};
