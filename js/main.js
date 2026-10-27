/* =========================================================
   PERFECT PLAYTIME — интерактив
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = n => '$' + n.toFixed(2);

  /* ---------- Данные ---------- */
  const PRODUCTS = [
    { id: 1, name: 'Baby Leather Carriage', price: 320, img: 'assets/img/p-carriage.jpg', cat: 'transport' },
    { id: 2, name: 'Baby Wooden Crib Small', price: 420, img: 'assets/img/p-crib.jpg', cat: 'furniture' },
    { id: 3, name: 'Baby Combo Fell', price: 250, img: 'assets/img/p-combo.jpg', cat: 'clothes' },
    { id: 4, name: 'Wooden Horse Baby Toy', price: 189, img: 'assets/img/p-horse.jpg', cat: 'toys' },
    { id: 5, name: 'Baby Dummie Pink', price: 20, img: 'assets/img/p-dummy.jpg', cat: 'care' },
    { id: 6, name: 'Baby Train Toy', price: 120, img: 'assets/img/p-train.jpg', cat: 'toys' },
    { id: 7, name: 'Wooden Baby Chair', price: 240, img: 'assets/img/chair.png', cat: 'furniture', hidden: true }
  ];

  const BEST = [
    { id: 7, name: 'Wooden<br>Baby Chair', img: 'assets/img/chair.png', photo: 'assets/img/baby-highchair.jpg' },
    { id: 2, name: 'Baby Wooden<br>Crib Small', img: 'assets/img/p-crib.jpg', photo: 'assets/img/baby-bed.jpg' },
    { id: 4, name: 'Wooden Horse<br>Baby Toy', img: 'assets/img/p-horse.jpg', photo: 'assets/img/kids.jpg' }
  ];

  const byId = id => PRODUCTS.find(p => p.id === id);

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* =========================================================
     Шапка: sticky-тень, бургер, активный пункт меню
     ========================================================= */
  const header = $('#header');
  const burger = $('#burger');
  const nav = $('#nav');
  const toTop = $('#toTop');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', scrollY > 10);
    toTop.classList.toggle('show', scrollY > 700);
  }, { passive: true });

  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
  });
  $$('.nav__link').forEach(link => link.addEventListener('click', () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
  }));

  // подсветка пункта меню текущей секции
  const sections = ['home', 'about', 'shop', 'contact'].map(id => document.getElementById(id));
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      $$('.nav__link').forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => s && navObserver.observe(s));

  /* ---------- Выбор локации ---------- */
  const locationEl = $('#location');
  const savedCity = localStorage.getItem('pp-city');
  if (savedCity) $('#locationText').textContent = savedCity;
  $('#locationBtn').addEventListener('click', e => {
    e.stopPropagation();
    locationEl.classList.toggle('open');
  });
  $$('#locationList li').forEach(li => li.addEventListener('click', () => {
    $('#locationText').textContent = li.textContent;
    localStorage.setItem('pp-city', li.textContent);
    locationEl.classList.remove('open');
    toast('Location: ' + li.textContent);
  }));
  document.addEventListener('click', () => locationEl.classList.remove('open'));

  /* =========================================================
     Hero-слайдер (автопрокрутка + стрелки + точки)
     ========================================================= */
  const heroImgs = $$('#heroSlides img');
  const heroDots = $('#heroDots');
  let heroIndex = 0;
  let heroTimer;

  heroImgs.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Слайд ' + (i + 1));
    b.addEventListener('click', () => { goHero(i); restartHero(); });
    heroDots.appendChild(b);
  });

  function goHero(i) {
    heroIndex = (i + heroImgs.length) % heroImgs.length;
    heroImgs.forEach((img, k) => img.classList.toggle('active', k === heroIndex));
    $$('button', heroDots).forEach((d, k) => d.classList.toggle('active', k === heroIndex));
  }
  function restartHero() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => goHero(heroIndex + 1), 5000);
  }
  $('#heroPrev').addEventListener('click', () => { goHero(heroIndex - 1); restartHero(); });
  $('#heroNext').addEventListener('click', () => { goHero(heroIndex + 1); restartHero(); });
  goHero(0);
  restartHero();

  /* ---------- Бегущая строка: дублируем группу для бесконечного цикла ---------- */
  const track = $('#marqueeTrack');
  const group = $('.marquee__group', track);
  track.appendChild(group.cloneNode(true));

  /* =========================================================
     Карусель категорий
     ========================================================= */
  const catTrack = $('#catTrack');
  let catPos = 0;
  function catStep() {
    const item = $('.cat', catTrack);
    const gap = parseFloat(getComputedStyle(catTrack).gap) || 0;
    return item.offsetWidth + gap;
  }
  function catMax() {
    const visible = Math.round(catTrack.parentElement.offsetWidth / catStep());
    return Math.max(0, catTrack.children.length - visible);
  }
  function moveCats(dir) {
    const max = catMax();
    catPos += dir;
    if (catPos > max) catPos = 0;
    if (catPos < 0) catPos = max;
    catTrack.style.transform = `translateX(${-catPos * catStep()}px)`;
  }
  $('#catPrev').addEventListener('click', () => moveCats(-1));
  $('#catNext').addEventListener('click', () => moveCats(1));
  window.addEventListener('resize', () => { catPos = Math.min(catPos, catMax()); moveCats(0); });

  // клик по категории — фильтрует товары
  $$('.cat').forEach(c => c.addEventListener('click', () => setFilter(c.dataset.filter)));

  /* =========================================================
     Best Seller слайдер
     ========================================================= */
  let bestIndex = 0;
  const bestImg = $('#bestImg');
  const bestPhoto = $('#bestPhoto');

  function showBest(i) {
    bestIndex = (i + BEST.length) % BEST.length;
    const item = BEST[bestIndex];
    const product = byId(item.id);
    bestImg.classList.add('swap');
    bestPhoto.classList.add('swap');
    setTimeout(() => {
      bestImg.src = item.img;
      bestPhoto.src = item.photo;
      $('#bestName').innerHTML = item.name;
      $('#bestPrice').textContent = money(product.price);
      bestImg.classList.remove('swap');
      bestPhoto.classList.remove('swap');
    }, 300);
  }
  $('#bestPrev').addEventListener('click', () => showBest(bestIndex - 1));
  $('#bestNext').addEventListener('click', () => showBest(bestIndex + 1));
  $('#bestAdd').addEventListener('click', () => addToCart(BEST[bestIndex].id));

  /* =========================================================
     Товары: рендер + фильтр + избранное
     ========================================================= */
  const productsEl = $('#products');
  let likes = JSON.parse(localStorage.getItem('pp-likes') || '[]');

  const heartSvg = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 21s-7.5-4.6-9.7-9.3C.8 8.4 3 4.5 6.6 4.5c2 0 3.6 1.1 4.4 2.6.8-1.5 2.4-2.6 4.4-2.6 3.6 0 5.8 3.9 4.3 7.2C19.5 16.4 12 21 12 21Z"/></svg>';
  const cartSvg = '<svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L21 7H6"/><circle cx="10" cy="20" r="1.4" fill="currentColor"/><circle cx="17" cy="20" r="1.4" fill="currentColor"/></svg>';
  const eyeSvg = '<svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>';

  function renderProducts(filter = 'all') {
    const list = PRODUCTS.filter(p => !p.hidden && (filter === 'all' || p.cat === filter));
    productsEl.innerHTML = list.length ? list.map((p, i) => `
      <article class="product" style="animation-delay:${i * 70}ms" data-id="${p.id}">
        <div class="product__actions">
          <button class="icon-btn like ${likes.includes(p.id) ? 'liked' : ''}" data-act="like" aria-label="В избранное">${heartSvg}</button>
          <button class="icon-btn" data-act="cart" aria-label="В корзину">${cartSvg}</button>
          <button class="icon-btn" data-act="view" aria-label="Быстрый просмотр">${eyeSvg}</button>
        </div>
        <div class="product__img" data-act="view"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
        <div class="product__body">
          <div class="product__tag">Specials</div>
          <h3 class="product__name" data-act="view">${p.name}</h3>
          <div class="product__price">${money(p.price)}</div>
        </div>
      </article>`).join('')
      : '<p class="products__empty">Скоро здесь появятся новые товары ✨</p>';
  }

  productsEl.addEventListener('click', e => {
    const actEl = e.target.closest('[data-act]');
    if (!actEl) return;
    const id = +actEl.closest('.product').dataset.id;
    const act = actEl.dataset.act;
    if (act === 'cart') addToCart(id);
    if (act === 'view') openQuickView(id);
    if (act === 'like') {
      likes = likes.includes(id) ? likes.filter(x => x !== id) : [...likes, id];
      localStorage.setItem('pp-likes', JSON.stringify(likes));
      actEl.classList.toggle('liked');
      toast(likes.includes(id) ? 'Added to wishlist' : 'Removed from wishlist');
    }
  });

  function setFilter(filter) {
    $$('.filter').forEach(f => f.classList.toggle('active', f.dataset.filter === filter));
    renderProducts(filter);
  }
  $$('.filter').forEach(f => f.addEventListener('click', () => setFilter(f.dataset.filter)));
  $('#exploreAll').addEventListener('click', () => setFilter('all'));
  renderProducts();

  /* =========================================================
     Корзина (localStorage)
     ========================================================= */
  let cart = JSON.parse(localStorage.getItem('pp-cart') || '{}'); // { id: qty }
  const drawer = $('#drawer');
  const overlay = $('#overlay');

  function saveCart() {
    localStorage.setItem('pp-cart', JSON.stringify(cart));
    renderCart();
  }

  function addToCart(id, qty = 1) {
    cart[id] = (cart[id] || 0) + qty;
    saveCart();
    const counter = $('#cartCount');
    counter.classList.remove('bump');
    void counter.offsetWidth;
    counter.classList.add('bump');
    toast(`«${byId(id).name}» added to cart`);
  }

  function renderCart() {
    const ids = Object.keys(cart).map(Number);
    const count = ids.reduce((s, id) => s + cart[id], 0);
    const total = ids.reduce((s, id) => s + cart[id] * byId(id).price, 0);
    $('#cartCount').textContent = count;
    $('#cartTotal').textContent = money(total);
    $('#cartItems').innerHTML = ids.length ? ids.map(id => {
      const p = byId(id);
      return `
        <div class="cart-item" data-id="${id}">
          <img src="${p.img}" alt="${p.name}">
          <div>
            <div class="cart-item__name">${p.name}</div>
            <div class="cart-item__price">${money(p.price)}</div>
            <div class="qty"><button data-q="-1">−</button><span>${cart[id]}</span><button data-q="1">+</button></div>
          </div>
          <button class="cart-item__remove" data-q="del" aria-label="Удалить">&times;</button>
        </div>`;
    }).join('') : '<div class="drawer__empty"><i class="crown"></i>Your cart is empty</div>';
  }

  $('#cartItems').addEventListener('click', e => {
    const btn = e.target.closest('[data-q]');
    if (!btn) return;
    const id = +btn.closest('.cart-item').dataset.id;
    const q = btn.dataset.q;
    if (q === 'del') delete cart[id];
    else {
      cart[id] += +q;
      if (cart[id] <= 0) delete cart[id];
    }
    saveCart();
  });

  function openDrawer() { drawer.classList.add('open'); overlay.classList.add('show'); document.body.style.overflow = 'hidden'; }
  function closeDrawer() { drawer.classList.remove('open'); overlay.classList.remove('show'); document.body.style.overflow = ''; }
  $('#cartBtn').addEventListener('click', openDrawer);
  $('#drawerClose').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  $('#checkoutBtn').addEventListener('click', () => {
    if (!Object.keys(cart).length) return toast('Your cart is empty');
    const total = $('#cartTotal').textContent;
    cart = {};
    saveCart();
    closeDrawer();
    openModal(`
      <div style="text-align:center">
        <i class="crown crown--lg"></i>
        <h3 class="title title--sm">Thank you!</h3>
        <p style="margin-top:12px;color:var(--muted)">Ваш заказ на сумму <b style="color:var(--coral)">${total}</b> оформлен.<br>Мы свяжемся с вами в ближайшее время.</p>
      </div>`);
  });
  renderCart();

  /* =========================================================
     Модальные окна: вход, регистрация, контакты, быстрый просмотр
     ========================================================= */
  const modal = $('#modal');
  const modalContent = $('#modalContent');

  function openModal(html, wide = false) {
    modalContent.innerHTML = html;
    modal.classList.toggle('modal--wide', wide);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
  }
  $('#modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeDrawer(); } });

  const FORMS = {
    login: {
      title: 'Log In',
      fields: '<input type="email" name="email" placeholder="Email" required><input type="password" name="password" placeholder="Password" minlength="6" required>',
      btn: 'Log In', ok: 'Welcome back! 👋'
    },
    register: {
      title: 'Register',
      fields: '<input type="text" name="name" placeholder="Your name" required><input type="email" name="email" placeholder="Email" required><input type="password" name="password" placeholder="Password (min 6)" minlength="6" required>',
      btn: 'Create account', ok: 'Account created! 🎉'
    },
    contact: {
      title: 'Contact Us',
      fields: '<input type="text" name="name" placeholder="Your name" required><input type="email" name="email" placeholder="Email" required><textarea name="msg" placeholder="Message" required></textarea>',
      btn: 'Send message', ok: 'Message sent! We will reply soon.'
    }
  };

  $$('[data-modal]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    const f = FORMS[el.dataset.modal];
    openModal(`
      <h3 class="title title--sm">${f.title}</h3>
      <form class="form" novalidate data-ok="${f.ok}">
        ${f.fields}
        <button class="btn btn--block" type="submit">${f.btn}</button>
        <p class="form__hint">Это демо-форма — данные никуда не отправляются</p>
      </form>`);
  }));

  // общая валидация форм в модалке
  modalContent.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    let valid = true;
    $$('input, textarea', form).forEach(inp => {
      const ok = inp.checkValidity() && inp.value.trim() !== '';
      inp.classList.toggle('invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) return toast('Please fill in all fields correctly');
    closeModal();
    toast(form.dataset.ok);
  });
  modalContent.addEventListener('input', e => e.target.classList.remove('invalid'));

  function openQuickView(id) {
    const p = byId(id);
    let qty = 1;
    openModal(`
      <div class="quick">
        <div class="quick__img"><img src="${p.img}" alt="${p.name}"></div>
        <div>
          <div class="quick__tag">Specials</div>
          <h3 class="title title--sm">${p.name}</h3>
          <div class="quick__price">${money(p.price)}</div>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Safe materials, soft colors and a design your little one will love.</p>
          <div class="quick__row">
            <div class="qty"><button data-qv="-1">−</button><span id="qvQty">1</span><button data-qv="1">+</button></div>
            <button class="btn" id="qvAdd">Add to cart</button>
          </div>
        </div>
      </div>`, true);
    $$('[data-qv]', modalContent).forEach(b => b.addEventListener('click', () => {
      qty = Math.max(1, qty + +b.dataset.qv);
      $('#qvQty').textContent = qty;
    }));
    $('#qvAdd').addEventListener('click', () => { addToCart(id, qty); closeModal(); });
  }

  // галерея — просмотр фото крупно
  $$('.gallery img').forEach(img => img.addEventListener('click', () => {
    openModal(`<img class="lightbox-img" src="${img.src}" alt="">`, true);
  }));

  /* =========================================================
     Статус «Открыто / Закрыто» по графику работы
     ========================================================= */
  (function openStatus() {
    const el = $('#openStatus');
    const now = new Date();
    const day = now.getDay(); // 0 — вс
    const h = now.getHours() + now.getMinutes() / 60;
    let open = false;
    if (day >= 1 && day <= 5) open = h >= 9 && h < 23;
    if (day === 6) open = h >= 10 && h < 21;
    el.textContent = open ? '● Open now' : '● Closed now';
    el.className = 'open-status ' + (open ? 'open' : 'closed');
  })();

  /* =========================================================
     Подписка в футере
     ========================================================= */
  $('#subscribe').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = $('#subEmail').value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    form.classList.remove('error');
    if (!ok) {
      void form.offsetWidth;
      form.classList.add('error');
      $('#subError').textContent = 'Please enter a valid email address';
      return;
    }
    $('#subError').textContent = '';
    form.reset();
    toast('Thanks for subscribing! 💌');
  });

  /* ---------- Анимация появления при скролле ---------- */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  $('#year').textContent = new Date().getFullYear();
})();
