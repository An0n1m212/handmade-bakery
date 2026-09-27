// ==============================================
// models/CustomOrder.js
// Модель индивидуального заказа (конструктор "по фото/референсу")
// ==============================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomOrder = sequelize.define('CustomOrder', {
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
  deliveryDate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  flavor: {
    type: DataTypes.STRING, // предпочтения по вкусу
    allowNull: true,
  },
  allergies: {
    type: DataTypes.STRING, // аллергены, которые нужно исключить
    allowNull: true,
  },
  wishes: {
    type: DataTypes.TEXT, // произвольные пожелания к оформлению
    allowNull: true,
  },
  // Путь к загруженному референсу (файл) или внешняя ссылка на фото
  referenceImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referenceLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'new',
  },
}, {
  tableName: 'custom_orders',
  timestamps: true,
});

module.exports = CustomOrder;
