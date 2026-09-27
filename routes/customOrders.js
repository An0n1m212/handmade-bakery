// ==============================================
// routes/customOrders.js
// POST /api/custom-order — индивидуальный заказ (конструктор по референсу)
// Поддерживает загрузку файла (multipart/form-data) ИЛИ ссылку на референс
// ==============================================

const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { CustomOrder } = require('../models');
const { notifyCustomOrder } = require('../services/telegram');

// --- Настройка загрузки файлов (референс-фото) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // максимум 5 МБ
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Разрешены только изображения JPG, PNG, WEBP'), ok);
  },
});

// POST /api/custom-order
// multipart/form-data поля:
// customerName, phone, deliveryDate, flavor, allergies, wishes, referenceLink,
// referenceFile (файл, необязательно)
router.post('/', upload.single('referenceFile'), async (req, res) => {
  try {
    const {
      customerName,
      phone,
      deliveryDate,
      flavor,
      allergies,
      wishes,
      referenceLink,
    } = req.body;

    if (!customerName || !phone || !deliveryDate) {
      return res.status(400).json({
        success: false,
        message: 'Заполните имя, телефон и желаемую дату доставки',
      });
    }

    const customOrder = await CustomOrder.create({
      customerName,
      phone,
      deliveryDate,
      flavor,
      allergies,
      wishes,
      referenceLink: referenceLink || null,
      referenceImage: req.file ? `/uploads/${req.file.filename}` : null,
    });

    notifyCustomOrder(customOrder).catch((e) =>
      console.error('Ошибка отправки Telegram-уведомления (custom order):', e)
    );

    res.status(201).json({
      success: true,
      message: 'Заявка на индивидуальный заказ принята! Мы свяжемся с вами для уточнения деталей.',
      customOrder,
    });
  } catch (error) {
    console.error('Ошибка создания индивидуального заказа:', error);
    res.status(500).json({ success: false, message: error.message || 'Ошибка сервера' });
  }
});

module.exports = router;
