const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const ProductModel = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    }
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  clothingType: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Other',
  },
  style: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Casual',
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ProductModel;
