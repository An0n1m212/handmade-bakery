// ==============================================
// config/database.js
// Настройка подключения к базе данных через Sequelize (SQLite)
// Для перехода на PostgreSQL достаточно поменять dialect и
// добавить параметры host/port/username/password/database.
// ==============================================

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_STORAGE || './database.sqlite',
  logging: false, // отключаем подробные логи SQL-запросов в консоли
});

module.exports = sequelize;
