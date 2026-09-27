// ==============================================
// models/Product.js
// Модель товара (торты, бенто-торты, фуд-букеты, наборы)
// ==============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  // Категория: cakes | bouquets | gifts
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Метка на карточке товара: Хит, Новинка, Акция и т.д.
  badge: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Ссылка/путь на изображение товара
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Доступен ли товар для заказа
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'products',
  timestamps: true,
});

module.exports = Product;
