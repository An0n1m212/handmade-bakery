// ==============================================
// services/telegram.js
// Отправка уведомлений о новых заказах в Telegram через Bot API
// ==============================================

require('dotenv').config();
const fetch = require('node-fetch');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Отправляет текстовое сообщение в Telegram-чат администратора.
 * Если токен/chat_id не настроены — просто логирует предупреждение,
 * чтобы не ронять сервер при локальной разработке без бота.
 */
async function sendTelegramMessage(text) {
  if (!BOT_TOKEN || !CHAT_ID || BOT_TOKEN.includes('Example')) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не настроены. Сообщение НЕ отправлено:');
    console.warn(text);
    return { ok: false, skipped: true };
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('❌ Ошибка Telegram API:', data);
    }
    return data;
  } catch (error) {
    console.error('❌ Не удалось отправить сообщение в Telegram:', error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Форматирует и отправляет уведомление о новом заказе из корзины.
 */
async function notifyNewOrder(order, itemsList) {
  const itemsText = itemsList
    .map((i) => `• ${i.title} × ${i.qty} = ${i.price * i.qty} грн`)
    .join('\n');

  const deliveryText =
    order.deliveryType === 'pickup'
      ? '🏠 Самовывоз'
      : `🚚 Доставка по адресу: ${order.address || '—'}`;

  const text =
    `🎂 <b>НОВЫЙ ЗАКАЗ #${order.id}</b>\n\n` +
    `👤 <b>Имя:</b> ${order.customerName}\n` +
    `📞 <b>Телефон:</b> ${order.phone}\n` +
    `${deliveryText}\n` +
    `📅 <b>Дата/время:</b> ${order.deliveryDate}\n\n` +
    `🛒 <b>Состав заказа:</b>\n${itemsText}\n\n` +
    `💰 <b>Итого: ${order.totalPrice} грн</b>\n` +
    (order.comment ? `\n💬 <b>Комментарий:</b> ${order.comment}` : '');

  return sendTelegramMessage(text);
}

/**
 * Форматирует и отправляет уведомление об индивидуальном заказе (конструктор).
 */
async function notifyCustomOrder(customOrder) {
  const text =
    `🎨 <b>ИНДИВИДУАЛЬНЫЙ ЗАКАЗ #${customOrder.id}</b>\n\n` +
    `👤 <b>Имя:</b> ${customOrder.customerName}\n` +
    `📞 <b>Телефон:</b> ${customOrder.phone}\n` +
    `📅 <b>Дата/время:</b> ${customOrder.deliveryDate}\n` +
    (customOrder.flavor ? `🍰 <b>Вкус:</b> ${customOrder.flavor}\n` : '') +
    (customOrder.allergies ? `⚠️ <b>Аллергены:</b> ${customOrder.allergies}\n` : '') +
    (customOrder.wishes ? `💬 <b>Пожелания:</b> ${customOrder.wishes}\n` : '') +
    (customOrder.referenceLink ? `🔗 <b>Референс (ссылка):</b> ${customOrder.referenceLink}\n` : '') +
    (customOrder.referenceImage ? `🖼 <b>Референс (файл):</b> загружен на сервер (${customOrder.referenceImage})\n` : '');

  return sendTelegramMessage(text);
}

module.exports = { sendTelegramMessage, notifyNewOrder, notifyCustomOrder };
