// ==============================================
// models/Order.js
// Модель заказа из основной корзины (каталог товаров)
// ==============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // 'delivery' — доставка по адресу, 'pickup' — самовывоз
  deliveryType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'delivery',
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deliveryDate: {
    type: DataTypes.STRING, // храним как строку (дата+время из формы)
    allowNull: false,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // JSON-строка со списком товаров: [{id, title, price, qty}, ...]
  items: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  // new | confirmed | in_progress | done | cancelled
  status: {
    type: DataTypes.STRING,
    defaultValue: 'new',
  },
}, {
  tableName: 'orders',
  timestamps: true,
});

module.exports = Order;
