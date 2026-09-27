// ==============================================
// seed.js
// Наполняет базу данных тестовыми товарами (8 позиций)
// Запуск: npm run seed
// ==============================================

const { initDatabase, Product } = require('./models');

const products = [
  {
    title: 'Торт "Красный бархат"',
    description: 'Нежные бисквитные коржи насыщенного бордового цвета с кремом на основе сливочного сыра.',
    price: 850,
    category: 'cakes',
    badge: 'Хит',
    image: 'https://images.unsplash.com/photo-1586985289906-406988974504?w=600&q=80',
  },
  {
    title: 'Бенто-торт "Мишка"',
    description: 'Мини-тортик на одну персону с милым дизайном — идеально для маленького праздника.',
    price: 420,
    category: 'cakes',
    badge: 'Новинка',
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=80',
  },
  {
    title: 'Торт "Медовик классический"',
    description: 'Тонкие медовые коржи и воздушный сметанный крем — любимая классика с детства.',
    price: 780,
    category: 'cakes',
    badge: null,
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=600&q=80',
  },
  {
    title: 'Фруктовый букет "Летнее настроение"',
    description: 'Клубника, виноград, ананас и киви на шпажках, оформленные в виде яркого букета.',
    price: 650,
    category: 'bouquets',
    badge: 'Хит',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80',
  },
  {
    title: 'Сырно-колбасный букет "Мужской"',
    description: 'Букет из сыра, колбасы и оливок — оригинальный съедобный подарок для мужчины.',
    price: 920,
    category: 'bouquets',
    badge: 'Новинка',
    image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=600&q=80',
  },
  {
    title: 'Клубника в шоколаде (букет)',
    description: 'Свежая клубника, покрытая бельгийским шоколадом трёх видов, в нарядной упаковке.',
    price: 590,
    category: 'bouquets',
    badge: null,
    image: 'https://images.unsplash.com/photo-1543158181-1274e5362710?w=600&q=80',
  },
  {
    title: 'Подарочный набор "Чайная церемония"',
    description: 'Набор мини-десертов, макарунов и авторского чая в подарочной коробке.',
    price: 1100,
    category: 'gifts',
    badge: 'Хит',
    image: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=600&q=80',
  },
  {
    title: 'Набор капкейков "Праздничный" (6 шт)',
    description: 'Шесть капкейков ассорти со сливочным кремом — отлично подойдёт для детского праздника.',
    price: 480,
    category: 'gifts',
    badge: null,
    image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&q=80',
  },
];

async function seed() {
  await initDatabase();

  const count = await Product.count();
  if (count > 0) {
    console.log(`ℹ️  В базе уже есть ${count} товаров. Очищаю и заполняю заново...`);
    await Product.destroy({ where: {}, truncate: true });
  }

  await Product.bulkCreate(products);
  console.log(`✅ Добавлено ${products.length} тестовых товаров.`);
  process.exit(0);
}

seed().catch((e) => {
  console.error('❌ Ошибка при заполнении базы данных:', e);
  process.exit(1);
});
