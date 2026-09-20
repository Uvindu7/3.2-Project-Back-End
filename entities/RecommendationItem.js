const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const RecommendationItem = sequelize.define('RecommendationItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  clothingType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  style: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'recommendation_items',
  timestamps: true,
});

module.exports = RecommendationItem;
