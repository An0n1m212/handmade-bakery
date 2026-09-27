// ==============================================
// routes/orders.js
// POST /api/orders — оформление заказа из корзины + уведомление в Telegram
// ==============================================

const express = require('express');
const router = express.Router();
const { Order, Product } = require('../models');
const { notifyNewOrder } = require('../services/telegram');

// POST /api/orders
// Тело запроса:
// {
//   customerName, phone, deliveryType ('delivery'|'pickup'), address,
//   deliveryDate, comment,
//   items: [{ id, qty }, ...]
// }
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      deliveryType,
      address,
      deliveryDate,
      comment,
      items,
    } = req.body;

    // --- Валидация обязательных полей ---
    if (!customerName || !phone || !deliveryDate) {
      return res.status(400).json({
        success: false,
        message: 'Заполните имя, телефон и дату доставки',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Корзина пуста — добавьте хотя бы один товар',
      });
    }

    if (deliveryType === 'delivery' && !address) {
      return res.status(400).json({
        success: false,
        message: 'Укажите адрес доставки или выберите самовывоз',
      });
    }

    // --- Пересчитываем состав и сумму заказа на СЕРВЕРЕ (не доверяем клиенту) ---
    const productIds = items.map((i) => i.id);
    const dbProducts = await Product.findAll({ where: { id: productIds } });

    const itemsList = [];
    let totalPrice = 0;

    for (const cartItem of items) {
      const product = dbProducts.find((p) => p.id === cartItem.id);
      if (!product) continue; // пропускаем несуществующие товары
      const qty = Math.max(1, parseInt(cartItem.qty, 10) || 1);
      const lineTotal = product.price * qty;
      totalPrice += lineTotal;
      itemsList.push({
        id: product.id,
        title: product.title,
        price: product.price,
        qty,
      });
    }

    if (itemsList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ни один товар из корзины не найден в каталоге',
      });
    }

    // --- Сохраняем заказ в БД ---
    const order = await Order.create({
      customerName,
      phone,
      deliveryType: deliveryType === 'pickup' ? 'pickup' : 'delivery',
      address: deliveryType === 'pickup' ? null : address,
      deliveryDate,
      comment,
      items: JSON.stringify(itemsList),
      totalPrice,
    });

    // --- Отправляем уведомление владельцу в Telegram (не блокируем ответ клиенту при ошибке) ---
    notifyNewOrder(order, itemsList).catch((e) =>
      console.error('Ошибка отправки Telegram-уведомления:', e)
    );

    res.status(201).json({
      success: true,
      message: 'Заказ успешно оформлен! Мы свяжемся с вами для подтверждения.',
      order: {
        id: order.id,
        totalPrice: order.totalPrice,
        items: itemsList,
      },
    });
  } catch (error) {
    console.error('Ошибка оформления заказа:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера при оформлении заказа' });
  }
});

// GET /api/orders — список заказов (для панели администратора, опционально)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

module.exports = router;
