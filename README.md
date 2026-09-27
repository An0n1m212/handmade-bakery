# 🎂 Handmade & Bakery

Полнофункциональный сайт-магазин домашней выпечки, тортов и съедобных фуд-букетов с корзиной, оформлением заказа и мгновенными уведомлениями владельцу в Telegram.

## Стек технологий

- **Frontend:** HTML5 + Tailwind CSS (через CDN, без сборки) + Vanilla JavaScript
- **Backend:** Node.js + Express.js
- **База данных:** SQLite через Sequelize ORM (легко переключается на PostgreSQL)
- **Интеграция:** Telegram Bot API — уведомления о новых заказах в реальном времени
- **Загрузка файлов:** Multer (для референс-фото в конструкторе)

## Структура проекта

```
handmade-bakery/
├── config/
│   └── database.js        # подключение к БД (Sequelize)
├── models/
│   ├── Product.js          # модель товара
│   ├── Order.js             # модель заказа из корзины
│   ├── CustomOrder.js       # модель индивидуального заказа
│   └── index.js             # сборка моделей + sync()
├── routes/
│   ├── products.js          # GET /api/products
│   ├── orders.js             # POST /api/orders
│   └── customOrders.js       # POST /api/custom-order
├── services/
│   └── telegram.js           # отправка уведомлений в Telegram
├── public/
│   ├── index.html             # разметка сайта (все секции)
│   ├── app.js                  # фронтенд-логика (каталог, корзина, формы)
│   └── style.css                # доп. стили поверх Tailwind
├── uploads/                       # сюда сохраняются загруженные референс-фото
├── seed.js                         # заполнение БД тестовыми товарами
├── server.js                        # точка входа Express-приложения
├── package.json
├── .env.example                      # шаблон переменных окружения
└── README.md
```

## 1. Установка зависимостей

Убедитесь, что установлен **Node.js версии 18+**, затем в папке проекта выполните:

```bash
npm install
```

## 2. Настройка переменных окружения

1. Скопируйте файл `.env.example` в `.env`:

   ```bash
   cp .env.example .env
   ```

2. Откройте `.env` и заполните:

   ```env
   PORT=3000
   TELEGRAM_BOT_TOKEN=ваш_токен_бота
   TELEGRAM_CHAT_ID=ваш_chat_id
   DB_STORAGE=./database.sqlite
   ```

### Как получить `TELEGRAM_BOT_TOKEN`:

1. Откройте Telegram и напишите боту **[@BotFather](https://t.me/BotFather)**.
2. Отправьте команду `/newbot` и следуйте инструкциям (укажите имя бота).
3. BotFather пришлёт токен вида `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` — скопируйте его в `.env`.

### Как получить `TELEGRAM_CHAT_ID`:

1. Напишите любое сообщение вашему новому боту (просто "Привет").
2. Откройте в браузере:
   `https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates`
3. В ответе найдите поле `"chat":{"id": ЧИСЛО, ...}` — это и есть ваш `TELEGRAM_CHAT_ID`.
   - Либо проще: напишите боту **[@userinfobot](https://t.me/userinfobot)** — он сразу пришлёт ваш ID.
4. Если хотите получать заказы в общий чат/канал — добавьте бота туда администратором и используйте ID чата/канала (начинается с `-100...`).

> ⚠️ Если не настроить токен и chat_id, сайт и заказы всё равно будут работать и сохраняться в базу данных — просто уведомление в Telegram не отправится, а в консоли сервера появится предупреждение.

## 3. Наполнение базы данных тестовыми товарами

```bash
npm run seed
```

Эта команда создаст таблицы (если их ещё нет) и добавит 8 тестовых товаров: торты, бенто-торт, фруктовый и сырно-колбасный букеты, клубнику в шоколаде и подарочные наборы.

## 4. Запуск сервера

**Обычный запуск:**

```bash
npm start
```

**Запуск с автоперезагрузкой при изменении кода (для разработки):**

```bash
npm run dev
```

После запуска сайт будет доступен по адресу:

```
http://localhost:3000
```

## API-эндпоинты

| Метод | Путь | Описание |
|---|---|---|
| `GET` | `/api/products` | Список товаров. Поддерживает `?category=cakes\|bouquets\|gifts` |
| `GET` | `/api/products/:id` | Один товар по ID |
| `POST` | `/api/orders` | Оформление заказа из корзины (JSON) + уведомление в Telegram |
| `GET` | `/api/orders` | Список всех заказов (для админ-панели) |
| `POST` | `/api/custom-order` | Индивидуальный заказ (multipart/form-data, поддерживает файл `referenceFile`) |
| `GET` | `/api/health` | Проверка, что сервер жив |

### Пример тела запроса `POST /api/orders`

```json
{
  "customerName": "Анна Иванова",
  "phone": "+380501234567",
  "deliveryType": "delivery",
  "address": "г. Кременчуг, ул. Центральная, 10",
  "deliveryDate": "2026-10-05",
  "comment": "Позвонить за час до доставки",
  "items": [
    { "id": 1, "qty": 1 },
    { "id": 4, "qty": 2 }
  ]
}
```

## Переход на PostgreSQL (по желанию)

1. Установите драйвер: `npm install pg pg-hstore`
2. В `config/database.js` замените конфигурацию `dialect: 'sqlite'` на:
   ```js
   const sequelize = new Sequelize(process.env.DATABASE_URL, {
     dialect: 'postgres',
     logging: false,
   });
   ```
3. Добавьте `DATABASE_URL=postgres://user:password@host:5432/dbname` в `.env`.

## Возможные доработки

- Админ-панель для управления товарами и статусами заказов.
- Онлайн-оплата (LiqPay, Fondy, Stripe).
- Личный кабинет клиента с историей заказов.
- Мультиязычность (укр/рус/англ).

---

Готово! Откройте `http://localhost:3000`, наполните корзину, оформите тестовый заказ — и проверьте, что уведомление пришло в ваш Telegram-чат. 🍰
