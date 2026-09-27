// ==============================================
// app.js
// Клиентская логика: загрузка каталога, фильтры,
// корзина, модальные окна, отправка форм на бэкенд
// ==============================================

const API_BASE = '/api';

// --- Состояние приложения ---
let allProducts = [];      // все товары, загруженные с сервера
let currentCategory = 'all';
let cart = [];              // [{ id, title, price, image, qty }]
let quickOrderProduct = null; // товар, выбранный через "Быстрый заказ"

// ==============================================
// УТИЛИТЫ
// ==============================================

function formatPrice(value) {
  return `${value.toLocaleString('ru-RU')} грн`;
}

function showToast(text = 'Товар добавлен в корзину 🎉') {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.remove('opacity-0', 'pointer-events-none');
  toast.classList.add('opacity-100');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.add('opacity-0', 'pointer-events-none');
    toast.classList.remove('opacity-100');
  }, 2200);
}

function openModal(id) {
  document.getElementById(id).classList.remove('modal-hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.add('modal-hidden');
  document.body.style.overflow = '';
}

// Закрытие модалок по клику на фон / крестик
document.querySelectorAll('[data-close-modal]').forEach((el) => {
  el.addEventListener('click', () => {
    closeModal('quickOrderModal');
    closeModal('cartModal');
  });
});

// ==============================================
// ЗАГРУЗКА И ОТРИСОВКА КАТАЛОГА
// ==============================================

async function loadProducts(category = 'all') {
  const grid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');

  try {
    const url = category === 'all'
      ? `${API_BASE}/products`
      : `${API_BASE}/products?category=${encodeURIComponent(category)}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.success) throw new Error(data.message || 'Ошибка загрузки товаров');

    allProducts = data.products;
    renderProducts(allProducts);
  } catch (error) {
    console.error(error);
    grid.innerHTML = `<p class="col-span-full text-center text-red-500 py-10">
      Не удалось загрузить каталог. Проверьте, что сервер запущен (npm start).
    </p>`;
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');

  if (products.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  grid.innerHTML = products.map((p) => `
    <div class="product-card bg-white rounded-2xl overflow-hidden shadow-md flex flex-col">
      <div class="relative">
        <img src="${p.image || 'https://via.placeholder.com/400x300?text=Handmade+Bakery'}" alt="${escapeHtml(p.title)}" class="w-full h-48 object-cover" />
        ${p.badge ? `<span class="absolute top-3 left-3 bg-pinkDark text-white text-xs font-bold px-3 py-1 rounded-full">${escapeHtml(p.badge)}</span>` : ''}
      </div>
      <div class="p-5 flex flex-col flex-1">
        <h3 class="font-display font-bold text-lg text-plum mb-1">${escapeHtml(p.title)}</h3>
        <p class="text-sm text-[#8a7a7a] mb-4 flex-1">${escapeHtml(p.description || '')}</p>
        <div class="flex items-center justify-between mb-4">
          <span class="font-bold text-xl text-plumDark">${formatPrice(p.price)}</span>
        </div>
        <div class="flex gap-2">
          <button class="flex-1 py-2.5 rounded-full bg-plum text-white text-sm font-bold hover:bg-plumDark transition-colors" data-add-to-cart="${p.id}">
            В корзину
          </button>
          <button class="flex-1 py-2.5 rounded-full border-2 border-plum text-plum text-sm font-bold hover:bg-plum hover:text-white transition-colors" data-quick-order="${p.id}">
            Быстрый заказ
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Навешиваем обработчики на кнопки карточек
  grid.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', () => addToCart(Number(btn.dataset.addToCart)));
  });
  grid.querySelectorAll('[data-quick-order]').forEach((btn) => {
    btn.addEventListener('click', () => openQuickOrder(Number(btn.dataset.quickOrder)));
  });
}

// Простая защита от XSS при вставке текста в innerHTML
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

// --- Фильтры каталога ---
document.querySelectorAll('.filter-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentCategory = tab.dataset.category;
    loadProducts(currentCategory);
  });
});

// ==============================================
// КОРЗИНА
// ==============================================

function addToCart(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((i) => i.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, title: product.title, price: product.price, image: product.image, qty: 1 });
  }
  updateCartUI();
  showToast(`«${product.title}» добавлен в корзину 🎉`);
}

function changeQty(productId, delta) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== productId);
  }
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter((i) => i.id !== productId);
  updateCartUI();
}

function getCartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function getCartCount() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

function updateCartUI() {
  // Счётчик в шапке
  const countEl = document.getElementById('cartCount');
  const count = getCartCount();
  if (count > 0) {
    countEl.textContent = count;
    countEl.classList.remove('hidden');
  } else {
    countEl.classList.add('hidden');
  }

  // Список в модальном окне корзины
  const listEl = document.getElementById('cartItemsList');
  const emptyMsg = document.getElementById('cartEmptyMessage');
  const totalBlock = document.getElementById('cartTotalBlock');

  if (cart.length === 0) {
    listEl.innerHTML = '';
    emptyMsg.classList.remove('hidden');
    totalBlock.classList.add('hidden');
  } else {
    emptyMsg.classList.add('hidden');
    totalBlock.classList.remove('hidden');
    listEl.innerHTML = cart.map((item) => `
      <div class="flex items-center gap-3 border-b border-pink/30 pb-3">
        <img src="${item.image || 'https://via.placeholder.com/80'}" class="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
        <div class="flex-1">
          <p class="font-bold text-plum text-sm">${escapeHtml(item.title)}</p>
          <p class="text-xs text-[#8a7a7a]">${formatPrice(item.price)} / шт</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="w-7 h-7 rounded-full bg-beige text-plum font-bold" data-qty-minus="${item.id}">−</button>
          <span class="w-5 text-center font-semibold">${item.qty}</span>
          <button class="w-7 h-7 rounded-full bg-beige text-plum font-bold" data-qty-plus="${item.id}">+</button>
        </div>
        <button class="text-[#c98a8a] text-lg ml-1" data-remove="${item.id}">&times;</button>
      </div>
    `).join('');

    listEl.querySelectorAll('[data-qty-minus]').forEach((b) => b.addEventListener('click', () => changeQty(Number(b.dataset.qtyMinus), -1)));
    listEl.querySelectorAll('[data-qty-plus]').forEach((b) => b.addEventListener('click', () => changeQty(Number(b.dataset.qtyPlus), 1)));
    listEl.querySelectorAll('[data-remove]').forEach((b) => b.addEventListener('click', () => removeFromCart(Number(b.dataset.remove))));
  }

  document.getElementById('cartTotalPrice').textContent = formatPrice(getCartTotal());
}

document.getElementById('cartButton').addEventListener('click', () => {
  updateCartUI();
  openModal('cartModal');
});

// Переключение поля адреса в зависимости от способа получения
document.querySelectorAll('input[name="deliveryType"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    const addressInput = document.getElementById('addressInput');
    if (radio.value === 'pickup' && radio.checked) {
      addressInput.required = false;
      addressInput.classList.add('opacity-50');
    } else if (radio.value === 'delivery' && radio.checked) {
      addressInput.required = true;
      addressInput.classList.remove('opacity-50');
    }
  });
});

// --- Оформление заказа (checkout) ---
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (cart.length === 0) {
    alert('Корзина пуста — добавьте хотя бы один товар из каталога.');
    return;
  }

  const form = e.target;
  const submitBtn = document.getElementById('checkoutSubmitBtn');
  const messageEl = document.getElementById('checkoutMessage');

  const payload = {
    customerName: form.customerName.value.trim(),
    phone: form.phone.value.trim(),
    deliveryType: form.deliveryType.value,
    address: form.address.value.trim(),
    deliveryDate: form.deliveryDate.value,
    comment: form.comment.value.trim(),
    items: cart.map((i) => ({ id: i.id, qty: i.qty })),
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправляем...';

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    messageEl.classList.remove('hidden');
    if (data.success) {
      messageEl.className = 'text-center font-semibold text-green-600';
      messageEl.textContent = data.message;
      cart = [];
      updateCartUI();
      form.reset();
      setTimeout(() => closeModal('cartModal'), 1800);
    } else {
      messageEl.className = 'text-center font-semibold text-red-500';
      messageEl.textContent = data.message || 'Ошибка оформления заказа';
    }
  } catch (error) {
    console.error(error);
    messageEl.classList.remove('hidden');
    messageEl.className = 'text-center font-semibold text-red-500';
    messageEl.textContent = 'Ошибка сети. Попробуйте ещё раз.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Оформить заказ';
  }
});

// ==============================================
// БЫСТРЫЙ ЗАКАЗ (один товар, без полной корзины)
// ==============================================

function openQuickOrder(productId) {
  quickOrderProduct = allProducts.find((p) => p.id === productId);
  if (!quickOrderProduct) return;
  document.getElementById('quickOrderProductName').textContent =
    `${quickOrderProduct.title} — ${formatPrice(quickOrderProduct.price)}`;
  document.getElementById('quickOrderForm').reset();
  openModal('quickOrderModal');
}

document.getElementById('quickOrderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!quickOrderProduct) return;

  const form = e.target;
  const payload = {
    customerName: form.customerName.value.trim(),
    phone: form.phone.value.trim(),
    deliveryType: 'delivery',
    address: 'Уточнить у клиента по телефону',
    deliveryDate: form.deliveryDate.value,
    comment: 'Оформлено через "Быстрый заказ"',
    items: [{ id: quickOrderProduct.id, qty: 1 }],
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправляем...';

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      showToast('Заказ отправлен! Мы скоро свяжемся с вами 📞');
      closeModal('quickOrderModal');
    } else {
      alert(data.message || 'Ошибка оформления заказа');
    }
  } catch (error) {
    console.error(error);
    alert('Ошибка сети. Попробуйте ещё раз.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Оформить заказ';
  }
});

// ==============================================
// ИНДИВИДУАЛЬНЫЙ ЗАКАЗ (конструктор по референсу)
// ==============================================

const referenceFileInput = document.getElementById('referenceFile');
referenceFileInput.addEventListener('change', () => {
  const fileLabel = document.getElementById('fileLabel');
  if (referenceFileInput.files.length > 0) {
    fileLabel.textContent = `Выбрано: ${referenceFileInput.files[0].name}`;
  } else {
    fileLabel.textContent = 'Нажмите, чтобы выбрать изображение (JPG/PNG, до 5 МБ)';
  }
});

document.getElementById('customOrderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const messageEl = document.getElementById('customOrderMessage');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Используем FormData, т.к. форма может содержать файл (multipart/form-data)
  const formData = new FormData(form);

  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправляем...';

  try {
    const res = await fetch(`${API_BASE}/custom-order`, {
      method: 'POST',
      body: formData, // Content-Type выставится браузером автоматически (с boundary)
    });
    const data = await res.json();

    messageEl.classList.remove('hidden');
    if (data.success) {
      messageEl.className = 'sm:col-span-2 text-center font-semibold text-green-300';
      messageEl.textContent = data.message;
      form.reset();
      document.getElementById('fileLabel').textContent = 'Нажмите, чтобы выбрать изображение (JPG/PNG, до 5 МБ)';
    } else {
      messageEl.className = 'sm:col-span-2 text-center font-semibold text-red-300';
      messageEl.textContent = data.message || 'Ошибка отправки заявки';
    }
  } catch (error) {
    console.error(error);
    messageEl.classList.remove('hidden');
    messageEl.className = 'sm:col-span-2 text-center font-semibold text-red-300';
    messageEl.textContent = 'Ошибка сети. Попробуйте ещё раз.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Отправить заявку';
  }
});

// ==============================================
// МОБИЛЬНОЕ МЕНЮ
// ==============================================

document.getElementById('burgerButton').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('hidden');
});
document.querySelectorAll('.mobile-link').forEach((link) => {
  link.addEventListener('click', () => document.getElementById('mobileMenu').classList.add('hidden'));
});

// ==============================================
// АНИМАЦИЯ ПОЯВЛЕНИЯ БЛОКОВ ПРИ СКРОЛЛЕ
// ==============================================

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ==============================================
// ИНИЦИАЛИЗАЦИЯ
// ==============================================

loadProducts('all');
updateCartUI();
