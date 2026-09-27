// ==============================================
// models/index.js
// Точка сборки моделей + синхронизация с базой данных
// ==============================================

const sequelize = require('../config/database');
const Product = require('./Product');
const Order = require('./Order');
const CustomOrder = require('./CustomOrder');

// Функция инициализации БД: создаёт таблицы, если их ещё нет
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к базе данных установлено');

    // alter: true — аккуратно обновляет структуру таблиц при изменении моделей
    await sequelize.sync({ alter: true });
    console.log('✅ Таблицы синхронизированы');
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
    process.exit(1);
  }
}

module.exports = {
  sequelize,
  Product,
  Order,
  CustomOrder,
  initDatabase,
};
