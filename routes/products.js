// ==============================================
// routes/products.js
// GET /api/products — получение каталога товаров с фильтрацией по категории
// ==============================================

const express = require('express');
const router = express.Router();
const { Product } = require('../models');

// GET /api/products?category=cakes
// category может быть: all | cakes | bouquets | gifts (или отсутствовать)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    const where = {};
    if (category && category !== 'all') {
      where.category = category;
    }

    const products = await Product.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('Ошибка получения товаров:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера при получении товаров' });
  }
});

// GET /api/products/:id — получение одного товара по id (пригодится для "быстрого заказа")
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Товар не найден' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('Ошибка получения товара:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

module.exports = router;
