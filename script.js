/**
 * AURA BOTANICA — Mini Checkout Boutique
 * script.js
 * Pure Vanilla JavaScript (ES6+), zero external libraries.
 */

'use strict';

/* ============================================================
   1. STATE & CONSTANTS
   ============================================================ */
const CART_STORAGE_KEY     = 'aura_botanica_cart_v1';
const WISHLIST_STORAGE_KEY = 'aura_botanica_wishlist_v1';

// Catalog metadata (Product A & Product B)
const CATALOG = {
  A: {
    id: 'A',
    name: 'Product A',
    subtitle: 'Walnut Acoustic Studio Headset',
    category: 'audio',
    categoryName: 'Acoustic Living',
    price: 500,
    description: 'Handcrafted wireless acoustic gear featuring organic walnut earcups, precision active noise isolation, and breathable memory foam.',
    specs: [
      '40-Hour Playback on single charge',
      'Solid organic walnut casing with brass hardware',
      'Hybrid active noise isolation mode',
      'Custom tuned 40mm neodymium drivers'
    ],
    svg: `
      <svg class="product-svg" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="44" fill="#FAF8F3" stroke="#D8DFD0" stroke-width="2"/>
        <path d="M28 54C28 36 36 24 50 24C64 24 72 36 72 54" stroke="#24352D" stroke-width="5" stroke-linecap="round"/>
        <path d="M34 50C34 38 40 30 50 30C60 30 66 38 66 50" stroke="#C47752" stroke-width="2.5" stroke-linecap="round"/>
        <rect x="20" y="52" width="15" height="26" rx="7" fill="#C47752"/>
        <rect x="65" y="52" width="15" height="26" rx="7" fill="#C47752"/>
        <rect x="23" y="56" width="7" height="18" rx="3.5" fill="#24352D"/>
        <rect x="70" y="56" width="7" height="18" rx="3.5" fill="#24352D"/>
      </svg>
    `
  },
  B: {
    id: 'B',
    name: 'Product B',
    subtitle: 'Terracotta Smart Organizer Pack',
    category: 'lifestyle',
    categoryName: 'Mindful Living',
    price: 300,
    description: 'Essential daily organizer pack woven from organic canvas with terracotta finishes, magnetic clasps, and modular gear dividers.',
    specs: [
      'Weather-resistant organic cotton twill',
      'Magnetic clasps with solid brass pins',
      'Modular padded dividers for cables and electronics',
      '1-Year comprehensive artisanal warranty'
    ],
    svg: `
      <svg class="product-svg" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="44" fill="#FAF8F3" stroke="#D8DFD0" stroke-width="2"/>
        <rect x="26" y="38" width="48" height="42" rx="8" fill="#24352D"/>
        <path d="M38 38V30C38 24.5 42.5 20 48 20H52C57.5 20 62 24.5 62 30V38" stroke="#C47752" stroke-width="4" stroke-linecap="round"/>
        <path d="M26 48C36 54 64 54 74 48V38H26V48Z" fill="#C47752"/>
        <rect x="46" y="47" width="8" height="10" rx="2" fill="#FAF8F3" stroke="#24352D" stroke-width="2"/>
      </svg>
    `
  }
};

const cart     = new Map(); // productId -> { id, name, price, qty }
const wishlist = new Set(); // Set of productIds
let orderPlaced = false;    // Guard against duplicate checkout submissions
let activeModalProductId = null;
let appliedCoupon = null;   // Active coupon code (e.g. 'BOTANICAL')
let discountPercent = 0;    // Active discount multiplier (0.10)

const VALID_COUPONS = {
  'BOTANICAL': 0.10,
  'WELCOME10': 0.10
};

/* ============================================================
   2. DOM REFERENCES
   ============================================================ */
// Cart Elements
const cartListEl          = document.getElementById('cart-list');
const cartEmptyEl         = document.getElementById('cart-empty');
const cartSummaryEl       = document.getElementById('cart-summary');
const cartCountEl         = document.getElementById('cart-count');
const headerCartBadgeEl   = document.getElementById('header-cart-badge');
const summarySubtotalEl   = document.getElementById('summary-subtotal');
const summaryDiscountRow  = document.getElementById('summary-discount-row');
const discountCodeLabel   = document.getElementById('discount-code-label');
const summaryDiscountEl   = document.getElementById('summary-discount');
const orderTotalEl        = document.getElementById('order-total');
const clearCartBtn        = document.getElementById('clear-cart-btn');

// Checkout Form Elements
const checkoutForm        = document.getElementById('checkout-form');
const customerNameEl      = document.getElementById('customer-name');
const nameErrorEl         = document.getElementById('name-error');
const customerEmailEl     = document.getElementById('customer-email');
const emailErrorEl        = document.getElementById('email-error');
const customerPhoneEl     = document.getElementById('customer-phone');
const phoneErrorEl        = document.getElementById('phone-error');
const deliveryPinEl       = document.getElementById('delivery-pin');
const pinErrorEl          = document.getElementById('pin-error');
const validationBanner    = document.getElementById('validation-banner');
const validationMsgEl     = document.getElementById('validation-message');
const placeOrderBtn       = document.getElementById('place-order-btn');

// Order Confirmation Modal Elements
const overlay             = document.getElementById('confirmation-overlay');
const confCustomer        = document.getElementById('conf-customer-name');
const confOrderRef        = document.getElementById('conf-order-ref');
const confTotal           = document.getElementById('conf-total');
const confDatetime        = document.getElementById('conf-datetime');
const confEstDelivery     = document.getElementById('conf-est-delivery');
const newOrderBtn         = document.getElementById('new-order-btn');
const printReceiptBtn     = document.getElementById('print-receipt-btn');

// Discovery, Search, Filters
const searchInput         = document.getElementById('search-input');
const searchStatusEl      = document.getElementById('search-status');
const sortSelect          = document.getElementById('sort-select');
const catPills            = document.querySelectorAll('.cat-pill');
const productsGrid        = document.getElementById('products-grid');

// Wishlist
const wishlistCountEl     = document.getElementById('wishlist-count');
const navWishlistBtn      = document.getElementById('nav-wishlist-btn');

// Quick View Modal
const quickViewOverlay    = document.getElementById('quick-view-overlay');
const closeQuickViewBtn   = document.getElementById('close-quick-view-btn');
const quickViewMedia      = document.getElementById('quick-view-media');
const quickViewCategory   = document.getElementById('quick-view-category');
const quickViewTitle      = document.getElementById('quick-view-title');
const quickViewPrice      = document.getElementById('quick-view-price');
const quickViewDesc       = document.getElementById('quick-view-description');
const quickViewSpecs      = document.getElementById('quick-view-specs');
const quickViewAddBtn     = document.getElementById('quick-view-add-btn');

// Coupon & Toast
const couponInput         = document.getElementById('coupon-input');
const applyCouponBtn      = document.getElementById('apply-coupon-btn');
const removeCouponBtn     = document.getElementById('remove-coupon-btn');
const couponFeedback      = document.getElementById('coupon-feedback');
const toastContainer      = document.getElementById('toast-container');
const mobileMenuBtn       = document.getElementById('mobile-menu-btn');
const mainNav             = document.getElementById('main-nav');

// Newsletter Elements
const newsletterForm      = document.getElementById('newsletter-form');
const newsletterEmail     = document.getElementById('newsletter-email');
const newsletterError     = document.getElementById('newsletter-error');
const newsletterSuccess   = document.getElementById('newsletter-success');

/* ============================================================
   3. PERSISTENCE HELPERS (localStorage)
   ============================================================ */
function loadPersistedState() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          if (item && item.id && CATALOG[item.id]) {
            cart.set(item.id, {
              id: item.id,
              name: item.name || CATALOG[item.id].name,
              price: item.price || CATALOG[item.id].price,
              qty: parseInt(item.qty, 10) || 1
            });
          }
        });
      }
    }

    const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (savedWishlist) {
      const parsedWishlist = JSON.parse(savedWishlist);
      if (Array.isArray(parsedWishlist)) {
        parsedWishlist.forEach(id => wishlist.add(id));
      }
    }
  } catch (err) {
    console.warn('Storage read fallback', err);
  }
}

function saveCartState() {
  try {
    const list = Array.from(cart.values());
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Storage write fallback', err);
  }
}

function saveWishlistState() {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(wishlist)));
  } catch (err) {
    console.warn('Storage write fallback', err);
  }
}

/* ============================================================
   4. PRODUCT ADD & CART ACTIONS
   ============================================================ */
function addToCart(id) {
  const product = CATALOG[id];
  if (!product) return;

  if (cart.has(id)) {
    cart.get(id).qty += 1;
  } else {
    cart.set(id, {
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1
    });
  }

  saveCartState();
  renderCart();
  triggerCartBump();
  showToast(`Added ${product.name} to shopping bag.`);
}

// Bind all .btn-add buttons (e.g. Product A & Product B)
document.querySelectorAll('.btn-add').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.productId;
    addToCart(id);
  });
});

/* ============================================================
   5. RENDER CART & LIVE CALCULATIONS
   ============================================================ */
function renderCart() {
  cartListEl.innerHTML = '';

  const hasItems = cart.size > 0;
  cartEmptyEl.hidden   = hasItems;
  cartSummaryEl.hidden = !hasItems;
  if (clearCartBtn) clearCartBtn.hidden = !hasItems;

  let subtotal   = 0;
  let totalItems = 0;

  cart.forEach(item => {
    const lineTotal = item.price * item.qty;
    subtotal   += lineTotal;
    totalItems += item.qty;

    const li = document.createElement('li');
    li.className = 'cart-item';
    li.dataset.productId = item.id;
    li.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${escHtml(item.name)}</div>
        <div class="cart-item-unit-price">&#x20B9;${item.price} each</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn btn-decrease" data-id="${item.id}" aria-label="Decrease quantity of ${escHtml(item.name)}">&#x2212;</button>
        <span class="cart-item-qty" data-qty="${item.qty}" aria-label="Quantity">${item.qty}</span>
        <button class="qty-btn btn-increase" data-id="${item.id}" aria-label="Increase quantity of ${escHtml(item.name)}">+</button>
      </div>
      <div class="cart-item-line-total">
        <span>Line total</span>
        <span class="line-total-amount" data-line-total="${lineTotal}">&#x20B9;${lineTotal}</span>
      </div>
      <div class="cart-item-action-row">
        <button class="btn-remove" data-id="${item.id}" aria-label="Remove ${escHtml(item.name)} from cart">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          <span>Remove</span>
        </button>
      </div>
    `;
    cartListEl.appendChild(li);
  });

  // Calculate discount if coupon is applied
  let discount = 0;
  if (appliedCoupon && VALID_COUPONS[appliedCoupon] && subtotal > 0) {
    discount = Math.round(subtotal * discountPercent);
  } else if (subtotal === 0) {
    appliedCoupon = null;
    discountPercent = 0;
    if (couponInput) couponInput.value = '';
    if (couponFeedback) couponFeedback.hidden = true;
  }

  const finalTotal = Math.max(0, subtotal - discount);

  // Subtotal & promotional discount display
  if (summarySubtotalEl) {
    summarySubtotalEl.textContent = `\u20B9${subtotal}`;
  }

  if (summaryDiscountRow && summaryDiscountEl && discountCodeLabel) {
    if (discount > 0) {
      summaryDiscountRow.hidden = false;
      discountCodeLabel.textContent = `${appliedCoupon} (-${Math.round(discountPercent * 100)}%)`;
      summaryDiscountEl.textContent = `-\u20B9${discount}`;
      if (removeCouponBtn) removeCouponBtn.hidden = false;
    } else {
      summaryDiscountRow.hidden = true;
      if (removeCouponBtn) removeCouponBtn.hidden = true;
    }
  }

  // Exactly update order-total & items count
  orderTotalEl.textContent = `\u20B9${finalTotal}`;

  cartCountEl.textContent = totalItems;
  if (headerCartBadgeEl) {
    headerCartBadgeEl.textContent = totalItems;
  }

  // Wire up quantity stepper & removal events
  cartListEl.querySelectorAll('.btn-increase').forEach(b =>
    b.addEventListener('click', () => {
      changeQty(b.dataset.id, 1);
      triggerCartBump();
    })
  );
  cartListEl.querySelectorAll('.btn-decrease').forEach(b =>
    b.addEventListener('click', () => {
      changeQty(b.dataset.id, -1);
      triggerCartBump();
    })
  );
  cartListEl.querySelectorAll('.btn-remove').forEach(b =>
    b.addEventListener('click', () => {
      removeItem(b.dataset.id);
      triggerCartBump();
    })
  );
}

function triggerCartBump() {
  cartCountEl.classList.add('bump');
  if (headerCartBadgeEl) headerCartBadgeEl.classList.add('bump');
  setTimeout(() => {
    cartCountEl.classList.remove('bump');
    if (headerCartBadgeEl) headerCartBadgeEl.classList.remove('bump');
  }, 220);
}

function changeQty(id, delta) {
  if (!cart.has(id)) return;
  const item = cart.get(id);
  item.qty += delta;
  if (item.qty <= 0) {
    cart.delete(id);
    showToast(`Removed ${item.name} from bag.`);
  }
  if (cart.size === 0) {
    appliedCoupon = null;
    discountPercent = 0;
    if (couponInput) couponInput.value = '';
    if (couponFeedback) couponFeedback.hidden = true;
  }
  saveCartState();
  renderCart();
}

function removeItem(id) {
  if (!cart.has(id)) return;
  const item = cart.get(id);
  cart.delete(id);
  if (cart.size === 0) {
    appliedCoupon = null;
    discountPercent = 0;
    if (couponInput) couponInput.value = '';
    if (couponFeedback) couponFeedback.hidden = true;
  }
  saveCartState();
  renderCart();
  showToast(`Removed ${item.name} from shopping bag.`);
}

if (clearCartBtn) {
  clearCartBtn.addEventListener('click', () => {
    if (cart.size === 0) return;
    cart.clear();
    appliedCoupon = null;
    discountPercent = 0;
    if (couponInput) couponInput.value = '';
    if (couponFeedback) couponFeedback.hidden = true;
    saveCartState();
    renderCart();
    showToast('Shopping bag cleared.');
  });
}

/* ============================================================
   6. CHECKOUT FORM SUBMISSION & IDEMPOTENCY
   ============================================================ */
checkoutForm.addEventListener('submit', event => {
  event.preventDefault();

  // Strict guard: prevent duplicate orders if already placed
  if (orderPlaced) return;

  clearValidation();

  const name = customerNameEl.value.trim();
  let valid  = true;

  // Validate customer name (REQUIRED)
  if (!name) {
    showFieldError(nameErrorEl, customerNameEl, 'Customer name is required.');
    valid = false;
  }

  // Validate shopping cart (must have at least one product)
  if (cart.size === 0) {
    showBanner('Your cart is empty. Please add at least one product before placing an order.');
    valid = false;
  }

  // Optional field format validations (validate only when provided)
  if (customerEmailEl && customerEmailEl.value.trim()) {
    const emailVal = customerEmailEl.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailVal)) {
      showFieldError(emailErrorEl, customerEmailEl, 'Please enter a valid email address.');
      valid = false;
    }
  }

  if (customerPhoneEl && customerPhoneEl.value.trim()) {
    const digits = customerPhoneEl.value.trim().replace(/\D/g, '');
    if (digits.length < 10) {
      showFieldError(phoneErrorEl, customerPhoneEl, 'Please enter a valid 10-digit mobile number.');
      valid = false;
    }
  }

  if (deliveryPinEl && deliveryPinEl.value.trim()) {
    const pinVal = deliveryPinEl.value.trim();
    if (!/^\d{6}$/.test(pinVal)) {
      showFieldError(pinErrorEl, deliveryPinEl, 'Please enter a valid 6-digit PIN code.');
      valid = false;
    }
  }

  if (!valid) return;

  // Prevent duplicate submissions immediately
  orderPlaced = true;
  placeOrderBtn.disabled = true;
  placeOrderBtn.innerHTML = `
    <span class="btn-content-default">
      <svg class="order-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>Order Placed</span>
    </span>
  `;

  placeOrder(name);
});

/* ============================================================
   7. PLACE ORDER & ORDER RECEIPT
   ============================================================ */
function placeOrder(name) {
  const ref      = generateOrderRef();
  const total    = computeTotal();
  const now      = new Date();
  const datetime = now.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: true
  });

  confCustomer.textContent = name;
  confOrderRef.textContent = ref;
  confTotal.textContent    = `\u20B9${total}`;
  confDatetime.textContent = datetime;

  // Delivery estimate
  if (confEstDelivery) {
    const est = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    confEstDelivery.textContent = `${est.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} (Estimated Demo)`;
  }

  // Display confirmation modal
  overlay.hidden = false;
  newOrderBtn.focus();
}

/* ============================================================
   8. START NEW ORDER (RESET STATE)
   ============================================================ */
newOrderBtn.addEventListener('click', () => {
  // Reset cart state & storage
  cart.clear();
  saveCartState();
  orderPlaced = false;

  // Reset coupon state
  appliedCoupon = null;
  discountPercent = 0;
  if (couponInput) couponInput.value = '';
  if (couponFeedback) couponFeedback.hidden = true;

  // Reset form inputs & validations
  checkoutForm.reset();
  clearValidation();

  // Reset button state
  placeOrderBtn.disabled  = false;
  placeOrderBtn.innerHTML = `
    <span class="btn-content-default">
      <svg class="order-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>Place Order</span>
    </span>
  `;

  // Hide overlay modal
  overlay.hidden = true;

  // Re-render empty cart
  renderCart();
  showToast('Ready for a new order.');
});

if (printReceiptBtn) {
  printReceiptBtn.addEventListener('click', () => {
    window.print();
  });
}

/* ============================================================
   9. QUICK VIEW MODAL
   ============================================================ */
document.querySelectorAll('.card-quick-view-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = btn.dataset.productId;
    openQuickView(id);
  });
});

function openQuickView(id) {
  const p = CATALOG[id];
  if (!p) return;
  activeModalProductId = id;

  quickViewMedia.innerHTML = p.svg;
  quickViewCategory.textContent = p.categoryName;
  quickViewTitle.textContent = p.name + ' — ' + p.subtitle;
  quickViewPrice.textContent = `₹${p.price}`;
  quickViewDesc.textContent = p.description;

  quickViewSpecs.innerHTML = p.specs
    .map(spec => `<li>&bull; ${spec}</li>`)
    .join('');

  quickViewOverlay.hidden = false;
}

if (closeQuickViewBtn) {
  closeQuickViewBtn.addEventListener('click', () => {
    quickViewOverlay.hidden = true;
  });
}

if (quickViewOverlay) {
  quickViewOverlay.addEventListener('click', (e) => {
    if (e.target === quickViewOverlay) {
      quickViewOverlay.hidden = true;
    }
  });
}

if (quickViewAddBtn) {
  quickViewAddBtn.addEventListener('click', () => {
    if (activeModalProductId) {
      addToCart(activeModalProductId);
      quickViewOverlay.hidden = true;
    }
  });
}

/* ============================================================
   10. WISHLIST FUNCTIONALITY
   ============================================================ */
function updateWishlistUI() {
  document.querySelectorAll('.card-wishlist-btn').forEach(btn => {
    const id = btn.dataset.productId;
    if (wishlist.has(id)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (wishlistCountEl) {
    wishlistCountEl.textContent = wishlist.size;
  }
}

document.querySelectorAll('.card-wishlist-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = btn.dataset.productId;
    if (wishlist.has(id)) {
      wishlist.delete(id);
      showToast(`Removed from Wishlist`);
    } else {
      wishlist.add(id);
      showToast(`Added ${CATALOG[id] ? CATALOG[id].name : 'product'} to Wishlist!`);
    }
    saveWishlistState();
    updateWishlistUI();
  });
});

if (navWishlistBtn) {
  navWishlistBtn.addEventListener('click', () => {
    if (wishlist.size === 0) {
      showToast('Your wishlist is empty. Tap the heart on any item!');
    } else {
      const names = Array.from(wishlist).map(id => CATALOG[id] ? CATALOG[id].name : id).join(', ');
      showToast(`Wishlist items: ${names}`);
    }
  });
}

/* ============================================================
   11. LIVE SEARCH & FILTERING
   ============================================================ */
if (searchInput) {
  searchInput.addEventListener('input', () => {
    applyCatalogFilters();
  });
}

catPills.forEach(pill => {
  pill.addEventListener('click', () => {
    catPills.forEach(p => {
      p.classList.remove('active');
      p.setAttribute('aria-selected', 'false');
    });
    pill.classList.add('active');
    pill.setAttribute('aria-selected', 'true');
    applyCatalogFilters();
  });
});

if (sortSelect) {
  sortSelect.addEventListener('change', () => {
    applyCatalogFilters();
  });
}

function applyCatalogFilters() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const activePill = document.querySelector('.cat-pill.active');
  const catFilter = activePill ? activePill.dataset.category : 'all';
  const sortMode = sortSelect ? sortSelect.value : 'featured';

  const cards = Array.from(productsGrid.querySelectorAll('.product-card'));
  let visibleCount = 0;

  cards.forEach(card => {
    const id = card.dataset.productId;
    const cat = card.dataset.category;
    const meta = CATALOG[id];
    if (!meta) return;

    let matchesSearch = true;
    if (query) {
      const haystack = (meta.name + ' ' + meta.subtitle + ' ' + meta.description).toLowerCase();
      matchesSearch = haystack.includes(query);
    }

    let matchesCat = true;
    if (catFilter !== 'all') {
      matchesCat = (cat === catFilter);
    }

    if (matchesSearch && matchesCat) {
      card.hidden = false;
      visibleCount++;
    } else {
      card.hidden = true;
    }
  });

  // Sort visible items
  if (sortMode === 'price-asc') {
    cards.sort((a, b) => parseInt(a.dataset.price, 10) - parseInt(b.dataset.price, 10))
         .forEach(c => productsGrid.appendChild(c));
  } else if (sortMode === 'price-desc') {
    cards.sort((a, b) => parseInt(b.dataset.price, 10) - parseInt(a.dataset.price, 10))
         .forEach(c => productsGrid.appendChild(c));
  }

  // Update status feedback
  if (searchStatusEl) {
    if (query || catFilter !== 'all') {
      searchStatusEl.hidden = false;
      searchStatusEl.textContent = `Showing ${visibleCount} product${visibleCount === 1 ? '' : 's'} matching your selection.`;
    } else {
      searchStatusEl.hidden = true;
    }
  }
}

/* ============================================================
   12. PROMO COUPON HANDLER
   ============================================================ */
if (applyCouponBtn && couponInput) {
  applyCouponBtn.addEventListener('click', () => {
    const code = couponInput.value.trim().toUpperCase();
    if (!code) {
      couponFeedback.hidden = false;
      couponFeedback.style.color = 'var(--clr-error)';
      couponFeedback.textContent = 'Please enter a coupon code.';
      return;
    }

    if (appliedCoupon === code) {
      couponFeedback.hidden = false;
      couponFeedback.style.color = 'var(--clr-forest)';
      couponFeedback.textContent = `Coupon "${code}" is already applied.`;
      return;
    }

    if (VALID_COUPONS[code]) {
      appliedCoupon = code;
      discountPercent = VALID_COUPONS[code];
      couponFeedback.hidden = false;
      couponFeedback.style.color = 'var(--clr-forest)';
      couponFeedback.textContent = `✓ Coupon "${code}" verified! 10% discount applied.`;
      renderCart();
      showToast(`Promo ${code} applied successfully!`);
    } else {
      couponFeedback.hidden = false;
      couponFeedback.style.color = 'var(--clr-error)';
      couponFeedback.textContent = 'Invalid promo code. Try BOTANICAL';
    }
  });
}

if (removeCouponBtn) {
  removeCouponBtn.addEventListener('click', () => {
    appliedCoupon = null;
    discountPercent = 0;
    if (couponInput) couponInput.value = '';
    if (couponFeedback) couponFeedback.hidden = true;
    renderCart();
    showToast('Coupon removed.');
  });
}

/* ============================================================
   13. NEWSLETTER SUBSCRIPTION
   ============================================================ */
if (newsletterForm && newsletterEmail) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterEmail.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      if (newsletterError) {
        newsletterError.textContent = 'Please enter your email address.';
        newsletterError.hidden = false;
      }
      if (newsletterSuccess) newsletterSuccess.hidden = true;
      newsletterEmail.focus();
      return;
    }

    if (!emailPattern.test(email)) {
      if (newsletterError) {
        newsletterError.textContent = 'Please enter a valid email address.';
        newsletterError.hidden = false;
      }
      if (newsletterSuccess) newsletterSuccess.hidden = true;
      newsletterEmail.focus();
      return;
    }

    if (newsletterError) newsletterError.hidden = true;
    if (newsletterSuccess) newsletterSuccess.hidden = false;
    newsletterEmail.value = '';
    showToast('Welcome to The Aura Dispatch circle!');
  });
}

/* ============================================================
   14. TOAST NOTIFICATIONS
   ============================================================ */
const activeToasts = new Map(); // key -> { element, timer, fadeTimer }

function showToast(message, key = null) {
  if (!toastContainer) return;
  const toastKey = key || message;

  // If a notification with this key already exists, refresh it instead of duplicating
  if (activeToasts.has(toastKey)) {
    const active = activeToasts.get(toastKey);
    clearTimeout(active.timer);
    clearTimeout(active.fadeTimer);

    // Refresh content and reset animation/visibility
    active.element.innerHTML = `<span>✦</span><span>${escHtml(message)}</span>`;
    active.element.style.opacity = '1';
    active.element.style.transform = 'translateY(0)';
    active.element.style.transition = 'none';

    // Micro-refresh pulse feedback
    active.element.classList.remove('toast-refresh');
    void active.element.offsetWidth; // trigger reflow
    active.element.classList.add('toast-refresh');

    // Reset auto-dismiss timer (2600ms)
    active.timer = setTimeout(() => {
      dismissToast(toastKey);
    }, 2600);

    return active.element;
  }

  // Create new toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.dataset.toastKey = toastKey;
  toast.innerHTML = `<span>✦</span><span>${escHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  const timer = setTimeout(() => {
    dismissToast(toastKey);
  }, 2600);

  activeToasts.set(toastKey, {
    element: toast,
    timer: timer,
    fadeTimer: null
  });

  return toast;
}

function dismissToast(toastKey) {
  if (!activeToasts.has(toastKey)) return;
  const active = activeToasts.get(toastKey);
  clearTimeout(active.timer);

  if (active.element) {
    active.element.style.opacity = '0';
    active.element.style.transform = 'translateY(8px)';
    active.element.style.transition = 'all 0.25s ease';

    active.fadeTimer = setTimeout(() => {
      if (active.element && active.element.parentNode) {
        active.element.remove();
      }
      activeToasts.delete(toastKey);
    }, 250);
  } else {
    activeToasts.delete(toastKey);
  }
}

/* ============================================================
   15. MOBILE NAVIGATION TOGGLE & INTERACTIVE CONTROLS
   ============================================================ */
if (mobileMenuBtn && mainNav) {
  mobileMenuBtn.addEventListener('click', () => {
    const isOpen = mainNav.style.display === 'flex';
    mainNav.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen) {
      mainNav.style.flexDirection = 'column';
      mainNav.style.position = 'absolute';
      mainNav.style.top = '100%';
      mainNav.style.left = '0';
      mainNav.style.right = '0';
      mainNav.style.background = 'var(--clr-cream)';
      mainNav.style.padding = '1.25rem 1.5rem';
      mainNav.style.boxShadow = 'var(--shadow-card)';
      mainNav.style.zIndex = '99';
      mainNav.style.borderBottom = '1px solid var(--clr-border)';
    }
  });
}

// Brand link scroll to top
const brandLink = document.querySelector('.brand-link');
if (brandLink) {
  brandLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('.nav-link[href="#hero-section"]')?.classList.add('active');
  });
}

// Navigation links active state
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    if (window.innerWidth <= 768 && mainNav) {
      mainNav.style.display = 'none';
    }
  });
});

// Demo Account Profile Action
const accountBtn = document.querySelector('.account-btn');
if (accountBtn) {
  accountBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Demo Profile: Guest Patron (Bengaluru Studio Club)', 'profile-notification');
  });
}

// Delivery Method Radio Sync
document.querySelectorAll('input[name="delivery-method"]').forEach(radio => {
  radio.addEventListener('change', () => {
    document.querySelectorAll('.delivery-option').forEach(opt => opt.classList.remove('active'));
    radio.closest('.delivery-option')?.classList.add('active');
    const isExpress = radio.value === 'express';
    showToast(isExpress ? 'Selected Artisanal Express Courier (Complimentary Demo)' : 'Selected Standard Courier Delivery');
  });
});

// Payment Method Radio Sync
document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
  radio.addEventListener('change', () => {
    document.querySelectorAll('.payment-card-option').forEach(opt => opt.classList.remove('active'));
    radio.closest('.payment-card-option')?.classList.add('active');
    const labels = {
      cod: 'Cash on Delivery selected (Demo Mode)',
      upi: 'Instant UPI mode selected (Demo Mode)',
      card: 'Debit / Credit Card interface selected (Demo Mode)'
    };
    showToast(labels[radio.value] || 'Payment method updated');
  });
});

// Escape key to dismiss modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === 'Esc') {
    if (quickViewOverlay && !quickViewOverlay.hidden) {
      quickViewOverlay.hidden = true;
    }
  }
});

// Footer Legal Links
document.querySelectorAll('.legal-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const text = link.textContent.trim();
    showToast(`${text}: Demonstration policy active.`);
  });
});

/* ============================================================
   16. HELPERS
   ============================================================ */
function computeTotal() {
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.qty;
  });
  if (appliedCoupon && VALID_COUPONS[appliedCoupon] && subtotal > 0) {
    const discount = Math.round(subtotal * VALID_COUPONS[appliedCoupon]);
    return Math.max(0, subtotal - discount);
  }
  return subtotal;
}

function generateOrderRef() {
  const ts     = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts}-${random}`;
}

function showFieldError(errorEl, inputEl, msg) {
  if (errorEl) errorEl.textContent = msg;
  if (inputEl) {
    inputEl.classList.add('input-error');
    inputEl.setAttribute('aria-invalid', 'true');
  }
}

function showBanner(msg) {
  validationMsgEl.textContent = msg;
  validationBanner.hidden     = false;
}

function clearValidation() {
  nameErrorEl.textContent     = '';
  customerNameEl.classList.remove('input-error');
  customerNameEl.removeAttribute('aria-invalid');

  if (emailErrorEl) emailErrorEl.textContent = '';
  if (customerEmailEl) {
    customerEmailEl.classList.remove('input-error');
    customerEmailEl.removeAttribute('aria-invalid');
  }

  if (phoneErrorEl) phoneErrorEl.textContent = '';
  if (customerPhoneEl) {
    customerPhoneEl.classList.remove('input-error');
    customerPhoneEl.removeAttribute('aria-invalid');
  }

  if (pinErrorEl) pinErrorEl.textContent = '';
  if (deliveryPinEl) {
    deliveryPinEl.classList.remove('input-error');
    deliveryPinEl.removeAttribute('aria-invalid');
  }

  validationBanner.hidden     = true;
  validationMsgEl.textContent = '';
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ============================================================
   17. INITIALIZATION
   ============================================================ */
loadPersistedState();
renderCart();
updateWishlistUI();
