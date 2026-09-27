// ==============================================
// server.js
// Точка входа Express-приложения "Handmade & Bakery"
// ==============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const { initDatabase } = require('./models');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const customOrderRouter = require('./routes/customOrders');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());                          // разрешаем запросы с фронтенда
app.use(morgan('dev'));                   // логирование запросов в консоль
app.use(express.json());                  // парсинг JSON тела запроса
app.use(express.urlencoded({ extended: true })); // парсинг form-data полей

// Раздача статики: главная страница, стили, скрипты
app.use(express.static(path.join(__dirname, 'public')));
// Раздача загруженных референс-фото
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API маршруты ---
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/custom-order', customOrderRouter);

// Простой health-check эндпоинт
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Сервер работает', timestamp: new Date().toISOString() });
});

// Обработка 404 для несуществующих API-маршрутов
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Эндпоинт не найден' });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Необработанная ошибка:', err);
  res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
});

// --- Запуск сервера ---
async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`\n🍰 Handmade & Bakery запущен: http://localhost:${PORT}\n`);
  });
}

start();
