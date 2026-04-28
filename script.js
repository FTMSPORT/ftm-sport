/* ============================================================
   FTM-SPORT — LÓGICA PRINCIPAL
   ============================================================
   - Carrito de pedidos con total
   - Envío por WhatsApp
   - Ver más productos (límite de 3)
   - Carrusel táctil por swipe
   ============================================================ */

const WA_NUMBER = '5493865740042';

// ── Estado del carrito ──────────────────────────────────────
let cart = [];

// ── Referencias al DOM ──────────────────────────────────────
const cartBtn     = document.getElementById('cartBtn');
const cartCount   = document.getElementById('cartCount');
const cartDrawer  = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose   = document.getElementById('cartClose');
const cartItems   = document.getElementById('cartItems');
const cartSend    = document.getElementById('cartSend');
const cartClear   = document.getElementById('cartClear');

// ── Abrir / cerrar carrito ───────────────────────────────────
function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ── Selector de variantes ────────────────────────────────────
document.querySelectorAll('.product-card').forEach(card => {
  const variantes = card.querySelectorAll('.variante');
  const carousel  = card.querySelector('.carousel');
  const addBtn    = card.querySelector('.add-to-cart');
  const baseName  = card.querySelector('h5')?.textContent.trim();

  if (!variantes.length) return;

  variantes.forEach(btn => {
    btn.addEventListener('click', () => {
      // Actualizar activo
      variantes.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Mover carrusel a la foto correspondiente
      if (carousel) {
        const track = carousel.querySelector('.carousel-track');
        const dots  = carousel.querySelectorAll('.dot');
        const index = parseInt(btn.dataset.index);
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
      }

      // Actualizar data-name con la variante seleccionada
      if (addBtn) {
        addBtn.dataset.name = `${baseName} - ${btn.textContent.trim()}`;
      }
    });
  });
});

// ── Agregar producto al carrito ──────────────────────────────
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const name  = btn.dataset.name;
    const price = btn.dataset.price;
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }
    btn.textContent = '✓ Agregado';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = '+ Agregar al pedido';
      btn.classList.remove('added');
    }, 1500);
    renderCart();
    openCart();
  });
});

// ── Renderizar carrito ───────────────────────────────────────
function renderCart() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = total;
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Todavía no agregaste productos.</p>';
    cartSend.style.opacity = '0.4';
    cartSend.style.pointerEvents = 'none';
    return;
  }

  cartSend.style.opacity = '1';
  cartSend.style.pointerEvents = 'all';

  cart.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price} c/u</div>
      </div>
      <div class="cart-item-controls">
        <button data-index="${index}" class="qty-minus">−</button>
        <span class="cart-item-qty">${item.qty}</span>
        <button data-index="${index}" class="qty-plus">+</button>
      </div>
    `;
    cartItems.appendChild(el);
  });

  // Total
  const totalMonto = cart.reduce((sum, item) => {
    const precio = parseFloat(item.price.replace(/\./g, '').replace(',', '.'));
    return sum + (isNaN(precio) ? 0 : precio * item.qty);
  }, 0);

  const totalEl = document.createElement('div');
  totalEl.className = 'cart-total';
  totalEl.innerHTML = `<span>Total estimado</span><span>$${totalMonto.toLocaleString('es-AR')}</span>`;
  cartItems.appendChild(totalEl);

  // Eventos cantidad
  cartItems.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.index);
      cart[i].qty -= 1;
      if (cart[i].qty <= 0) cart.splice(i, 1);
      renderCart();
    });
  });
  cartItems.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.index);
      cart[i].qty += 1;
      renderCart();
    });
  });

  buildWhatsAppLink(totalMonto);
}

// ── Armar mensaje de WhatsApp ────────────────────────────────
function buildWhatsAppLink(totalMonto) {
  if (cart.length === 0) return;
  let mensaje = '¡Hola! Me gustaría consultar por los siguientes productos:\n\n';
  cart.forEach(item => {
    mensaje += `• ${item.name} x${item.qty} — $${item.price}\n`;
  });
  mensaje += `\nTotal estimado: $${totalMonto.toLocaleString('es-AR')}`;
  mensaje += '\n\n¿Tienen disponibilidad?';
  cartSend.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}
// ── Scroll a categoría ───────────────────────────────────────
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    const offset = 150; // navbar + cat-bar
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── Vaciar carrito ───────────────────────────────────────────
cartClear.addEventListener('click', () => {
  cart = [];
  renderCart();
});

// ── Ver más productos / Ver menos (de a 3) ──────────────────
document.querySelectorAll('.cat-section').forEach(section => {
  const cards = Array.from(section.querySelectorAll('.product-card'));
  const btn   = section.querySelector('.ver-mas-btn');

  if (cards.length <= 3) {
    if (btn) btn.style.display = 'none';
    return;
  }

  let visible = 3;

  cards.forEach((card, i) => {
    if (i >= 3) card.classList.add('hidden');
  });

  // Crear botón "Ver menos" fijo
  const btnMenos = document.createElement('button');
  btnMenos.className = 'ver-mas-btn';
  btnMenos.textContent = 'Ver menos ↑';
  btnMenos.style.display = 'none';
  btn.parentNode.insertBefore(btnMenos, btn.nextSibling);

  if (btn) {
    btn.addEventListener('click', () => {
      const siguiente = Math.min(visible + 3, cards.length);
      cards.slice(visible, siguiente).forEach(card => {
        card.classList.remove('hidden');
      });
      visible = siguiente;

      btnMenos.style.display = 'block';

      if (visible >= cards.length) {
        btn.style.display = 'none';
      }
    });
  }

  btnMenos.addEventListener('click', () => {
    visible = 3;
    cards.forEach((card, i) => {
      if (i >= 3) card.classList.add('hidden');
    });
    btn.style.display = 'block';
    btnMenos.style.display = 'none';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── Carrusel táctil ──────────────────────────────────────────
document.querySelectorAll('.carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const dots  = carousel.querySelectorAll('.dot');
  if (!track) return;

  let index     = 0;
  let startX    = 0;
  let isDragging = false;

  function goTo(i) {
    const total = track.children.length;
    if (total <= 1) return;
    index = (i + total) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, j) => d.classList.toggle('active', j === index));
  }

  // Ocultar dots si hay una sola imagen
  if (track.children.length <= 1) {
    const dotsContainer = carousel.querySelector('.carousel-dots');
    if (dotsContainer) dotsContainer.style.display = 'none';
  }

  // Touch (celular)
  carousel.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  carousel.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? index + 1 : index - 1);
  }, { passive: true });

  // Mouse (desktop)
  carousel.addEventListener('mousedown', e => {
    startX = e.clientX;
    isDragging = true;
    carousel.classList.add('dragging');
  });
  carousel.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove('dragging');
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? index + 1 : index - 1);
  });
  carousel.addEventListener('mouseleave', () => {
    isDragging = false;
    carousel.classList.remove('dragging');
  });
});

// ── Init ─────────────────────────────────────────────────────
renderCart();


document.querySelectorAll('.product-card').forEach(card => {
  const colores = card.querySelectorAll('.color-dot');
  const addBtn = card.querySelector('.add-to-cart');
  const baseName = card.querySelector('h5')?.textContent.trim();

  colores.forEach(dot => {
    dot.addEventListener('click', () => {
      // Cambiar clase activa entre los círculos
      colores.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');

      // Obtener talle y color para actualizar el botón
      const talle = card.querySelector('.variante.active')?.textContent || '';
      const color = dot.getAttribute('data-color');

      // Actualizar el data-name del botón de compra
      addBtn.setAttribute('data-name', `${baseName} - Talle ${talle} - ${color}`);
    });
  });
});