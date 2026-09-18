const sequelize = require('../configs/database');
const User = require('./User');
const Review = require('./Review');
const Category = require('./Category');
const Product = require('./Product');

// Define Relationships

// A Category has many Products
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// You can define User and Review relationships here if needed
// e.g., User.hasMany(Review)
// Review.belongsTo(User)

module.exports = {
  User,
  Review,
  Category,
  Product
};
