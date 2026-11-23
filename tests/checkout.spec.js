// tests/checkout.spec.js
// Comprehensive Browser Automation Suite for Aura Botanica / Mini Checkout
// Includes all original TC-01 to TC-05 tests + new expanded shopping tests

const { test, expect } = require('@playwright/test');

// ─────────────────────────────────────────────────────────────
// Fresh page state before every test
// ─────────────────────────────────────────────────────────────
test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.site-header')).toBeVisible();
});

// ─────────────────────────────────────────────────────────────
// TC-01: Successful Checkout (Original test preserved)
// ─────────────────────────────────────────────────────────────
test('TC-01: Successful checkout shows confirmation and order reference', async ({ page }) => {
  // Add Product A
  await page.getByRole('button', { name: 'Add Product A to cart' }).click();
  await expect(page.locator('.cart-item[data-product-id="A"]')).toBeVisible();

  // Enter customer name
  await page.fill('#customer-name', 'Alice Kumar');

  // Place order
  await page.getByRole('button', { name: 'Place your order' }).click();

  // Confirmation modal visible
  const overlay = page.locator('#confirmation-overlay');
  await expect(overlay).toBeVisible();
  await expect(page.locator('#confirmation-title')).toHaveText('Order Confirmed!');

  // Order reference present and matches expected pattern
  const orderRef = page.locator('#conf-order-ref');
  await expect(orderRef).toBeVisible();
  const refText = await orderRef.textContent();
  expect(refText.trim()).toMatch(/^ORD-/);

  // Customer name shown correctly
  await expect(page.locator('#conf-customer-name')).toHaveText('Alice Kumar');

  // Total = ₹500 (Product A × 1)
  await expect(page.locator('#conf-total')).toHaveText('₹500');
});

// ─────────────────────────────────────────────────────────────
// TC-02: Missing Customer Name – validation blocks checkout (Original)
// ─────────────────────────────────────────────────────────────
test('TC-02: Checkout blocked and cart preserved when customer name is blank', async ({ page }) => {
  // Add Product B
  await page.getByRole('button', { name: 'Add Product B to cart' }).click();
  await expect(page.locator('.cart-item[data-product-id="B"]')).toBeVisible();

  // Leave customer name blank and click Place Order
  await page.getByRole('button', { name: 'Place your order' }).click();

  // Confirmation overlay must NOT appear
  await expect(page.locator('#confirmation-overlay')).toBeHidden();

  // Field-level error visible with correct message
  const nameError = page.locator('#name-error');
  await expect(nameError).toBeVisible();
  await expect(nameError).toHaveText('Customer name is required.');

  // Cart contents preserved
  await expect(page.locator('.cart-item[data-product-id="B"]')).toBeVisible();
  await expect(page.locator('#cart-count')).toHaveText('1');
});

// ─────────────────────────────────────────────────────────────
// TC-03: Quantity and Total Calculation (Original)
// ─────────────────────────────────────────────────────────────
test('TC-03: Quantity changes update line totals and order total correctly', async ({ page }) => {
  // Add Product A
  await page.getByRole('button', { name: 'Add Product A to cart' }).click();
  const itemA = page.locator('.cart-item[data-product-id="A"]');
  await expect(itemA).toBeVisible();

  // Initial line total = ₹500
  await expect(itemA.locator('.line-total-amount')).toHaveText('₹500');

  // Increase quantity to 2
  await itemA.getByRole('button', { name: /Increase quantity of Product A/i }).click();

  // Line total for Product A = ₹1000
  await expect(itemA.locator('.line-total-amount')).toHaveText('₹1000');
  await expect(itemA.locator('.cart-item-qty')).toHaveText('2');
  await expect(page.locator('#order-total')).toHaveText('₹1000');

  // Add Product B
  await page.getByRole('button', { name: 'Add Product B to cart' }).click();
  const itemB = page.locator('.cart-item[data-product-id="B"]');
  await expect(itemB).toBeVisible();

  // Final order total = ₹1300
  await expect(page.locator('#order-total')).toHaveText('₹1300');
  await expect(itemB.locator('.line-total-amount')).toHaveText('₹300');
});

// ─────────────────────────────────────────────────────────────
// TC-04: Empty Cart – checkout blocked (Original)
// ─────────────────────────────────────────────────────────────
test('TC-04: Checkout blocked when cart is empty', async ({ page }) => {
  // Do NOT add any products

  // Enter a valid customer name
  await page.fill('#customer-name', 'Bob Sharma');

  // Click Place Order
  await page.getByRole('button', { name: 'Place your order' }).click();

  // Confirmation overlay must NOT appear
  await expect(page.locator('#confirmation-overlay')).toBeHidden();

  // Validation banner must be visible with correct message
  const banner = page.locator('#validation-banner');
  await expect(banner).toBeVisible();

  const bannerText = await page.locator('#validation-message').textContent();
  expect(bannerText).toContain('cart is empty');

  // Cart remains empty
  await expect(page.locator('#cart-empty')).toBeVisible();
  await expect(page.locator('#cart-count')).toHaveText('0');
});

// ─────────────────────────────────────────────────────────────
// TC-05: Rapid double-click – only one order generated (Original)
// ─────────────────────────────────────────────────────────────
test('TC-05: Rapid double-click on Place Order generates only one confirmation', async ({ page }) => {
  // Add Product A
  await page.getByRole('button', { name: 'Add Product A to cart' }).click();
  await expect(page.locator('.cart-item[data-product-id="A"]')).toBeVisible();

  // Enter customer name
  await page.fill('#customer-name', 'Jane Smith');

  const placeOrderBtn = page.getByRole('button', { name: 'Place your order' });

  // First click: place the order
  await placeOrderBtn.click();

  // Immediately after first click, the button should be disabled (duplicate guard)
  await expect(placeOrderBtn).toBeDisabled();

  // Second click: attempt to click again (force=true to bypass enabled check in Playwright,
  // mimicking a user who clicks very fast before visual feedback appears)
  await placeOrderBtn.click({ force: true });

  // Exactly one confirmation overlay visible
  const overlays = page.locator('#confirmation-overlay');
  await expect(overlays).toBeVisible();

  // Exactly one order reference element (not duplicated)
  const orderRefs = page.locator('#conf-order-ref');
  await expect(orderRefs).toHaveCount(1);

  const refText = await orderRefs.textContent();
  expect(refText.trim()).toMatch(/^ORD-/);

  // Confirmation title appears only once
  await expect(page.locator('#confirmation-title')).toHaveCount(1);
  await expect(page.locator('#confirmation-title')).toHaveText('Order Confirmed!');
});

// ─────────────────────────────────────────────────────────────
// TC-06: Live Product Search dynamically filters catalog
// ─────────────────────────────────────────────────────────────
test('TC-06: Live Product Search dynamically filters catalog', async ({ page }) => {
  const searchInput = page.locator('#search-input');
  await expect(searchInput).toBeVisible();

  // Search for "Product A" or "Walnut"
  await searchInput.fill('Walnut');

  // Product A should remain visible
  await expect(page.locator('.product-card[data-product-id="A"]')).toBeVisible();

  // Product B should be hidden
  await expect(page.locator('.product-card[data-product-id="B"]')).toBeHidden();

  // Clear search query
  await searchInput.fill('');
  await expect(page.locator('.product-card[data-product-id="A"]')).toBeVisible();
  await expect(page.locator('.product-card[data-product-id="B"]')).toBeVisible();
});

// ─────────────────────────────────────────────────────────────
// TC-07: Wishlist toggling and counter updates
// ─────────────────────────────────────────────────────────────
test('TC-07: Wishlist toggles and updates badge count', async ({ page }) => {
  const wishlistBtnA = page.locator('.card-wishlist-btn[data-product-id="A"]');
  const wishlistCount = page.locator('#wishlist-count');

  // Initial count is 0
  await expect(wishlistCount).toHaveText('0');

  // Click to add Product A to wishlist
  await wishlistBtnA.click();
  await expect(wishlistBtnA).toHaveClass(/active/);
  await expect(wishlistCount).toHaveText('1');

  // Click again to remove
  await wishlistBtnA.click();
  await expect(wishlistBtnA).not.toHaveClass(/active/);
  await expect(wishlistCount).toHaveText('0');
});

// ─────────────────────────────────────────────────────────────
// TC-08: Shopping Cart persistence across page reload
// ─────────────────────────────────────────────────────────────
test('TC-08: Shopping Cart persists in localStorage across page reload', async ({ page }) => {
  // Add Product B to cart
  await page.getByRole('button', { name: 'Add Product B to cart' }).click();
  await expect(page.locator('.cart-item[data-product-id="B"]')).toBeVisible();
  await expect(page.locator('#order-total')).toHaveText('₹300');

  // Reload the browser page
  await page.reload({ waitUntil: 'domcontentloaded' });

  // Cart item and order total must still be present
  await expect(page.locator('.cart-item[data-product-id="B"]')).toBeVisible();
  await expect(page.locator('#order-total')).toHaveText('₹300');
  await expect(page.locator('#cart-count')).toHaveText('1');
});

// ─────────────────────────────────────────────────────────────
// TC-09: Removing product from cart updates order total
// ─────────────────────────────────────────────────────────────
test('TC-09: Removing product from cart updates order total and line items', async ({ page }) => {
  // Add Product A and Product B
  await page.getByRole('button', { name: 'Add Product A to cart' }).click();
  await page.getByRole('button', { name: 'Add Product B to cart' }).click();
  await expect(page.locator('#order-total')).toHaveText('₹800');

  // Click Remove on Product A
  const removeBtnA = page.locator('.cart-item[data-product-id="A"] .btn-remove');
  await removeBtnA.click();

  // Product A is removed, Product B remains
  await expect(page.locator('.cart-item[data-product-id="A"]')).toBeHidden();
  await expect(page.locator('.cart-item[data-product-id="B"]')).toBeVisible();
  await expect(page.locator('#order-total')).toHaveText('₹300');
  await expect(page.locator('#cart-count')).toHaveText('1');
});

// ─────────────────────────────────────────────────────────────
// TC-10: Quick View Product Modal opens with specifications
// ─────────────────────────────────────────────────────────────
test('TC-10: Quick View Product Modal displays specs and allows adding to bag', async ({ page }) => {
  const quickViewBtn = page.locator('.card-quick-view-btn[data-product-id="A"]');
  await quickViewBtn.click({ force: true });

  const modal = page.locator('#quick-view-overlay');
  await expect(modal).toBeVisible();

  await expect(page.locator('#quick-view-title')).toContainText('Product A');
  await expect(page.locator('#quick-view-price')).toHaveText('₹500');

  // Click Add in modal
  await page.locator('#quick-view-add-btn').click();
  await expect(modal).toBeHidden();

  // Item added to cart
  await expect(page.locator('.cart-item[data-product-id="A"]')).toBeVisible();
  await expect(page.locator('#cart-count')).toHaveText('1');
});

// ─────────────────────────────────────────────────────────────
// TC-11: Mobile responsive navigation and layout verification
// ─────────────────────────────────────────────────────────────
test('TC-11: Mobile viewport renders responsive navigation and cards', async ({ page }) => {
  // Resize to mobile viewport (iPhone 13 width 390px)
  await page.setViewportSize({ width: 390, height: 844 });

  // Mobile menu button should be visible
  await expect(page.locator('#mobile-menu-btn')).toBeVisible();

  // Product cards and cart are accessible
  await expect(page.locator('.product-card[data-product-id="A"]')).toBeVisible();
  await expect(page.locator('#cart-section')).toBeVisible();
  await expect(page.locator('#checkout-section')).toBeVisible();
});

// ─────────────────────────────────────────────────────────────
// TC-12: Promotional coupon discount calculation (BOTANICAL)
// ─────────────────────────────────────────────────────────────
test('TC-12: Promotional coupon discount calculation (BOTANICAL) reduces order total by 10%', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Product A to cart' }).click();
  await expect(page.locator('#order-total')).toHaveText('₹500');

  await page.fill('#coupon-input', 'BOTANICAL');
  await page.locator('#apply-coupon-btn').click();

  await expect(page.locator('#summary-discount-row')).toBeVisible();
  await expect(page.locator('#discount-code-label')).toContainText('BOTANICAL');
  await expect(page.locator('#summary-discount')).toHaveText('-₹50');
  await expect(page.locator('#order-total')).toHaveText('₹450');
  await expect(page.locator('#remove-coupon-btn')).toBeVisible();
});

// ─────────────────────────────────────────────────────────────
// TC-13: Re-applying active coupon is guarded against duplication
// ─────────────────────────────────────────────────────────────
test('TC-13: Re-applying active coupon is guarded against duplication', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Product A to cart' }).click();
  await page.fill('#coupon-input', 'BOTANICAL');
  await page.locator('#apply-coupon-btn').click();
  await expect(page.locator('#order-total')).toHaveText('₹450');

  // Click apply again with same code
  await page.locator('#apply-coupon-btn').click();
  const feedback = page.locator('#coupon-feedback');
  await expect(feedback).toBeVisible();
  await expect(feedback).toHaveText(/already applied/i);
  await expect(page.locator('#order-total')).toHaveText('₹450');
});

// ─────────────────────────────────────────────────────────────
// TC-14: Removing promo coupon restores standard subtotal
// ─────────────────────────────────────────────────────────────
test('TC-14: Removing promo coupon restores standard subtotal and hides discount row', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Product A to cart' }).click();
  await page.fill('#coupon-input', 'BOTANICAL');
  await page.locator('#apply-coupon-btn').click();
  await expect(page.locator('#order-total')).toHaveText('₹450');

  // Click remove coupon
  await page.locator('#remove-coupon-btn').click();
  await expect(page.locator('#summary-discount-row')).toBeHidden();
  await expect(page.locator('#remove-coupon-btn')).toBeHidden();
  await expect(page.locator('#order-total')).toHaveText('₹500');
});

// ─────────────────────────────────────────────────────────────
// TC-15: Invalid promo code displays error message
// ─────────────────────────────────────────────────────────────
test('TC-15: Invalid promo code displays error message without applying discount', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Product A to cart' }).click();
  await page.fill('#coupon-input', 'INVALID99');
  await page.locator('#apply-coupon-btn').click();

  const feedback = page.locator('#coupon-feedback');
  await expect(feedback).toBeVisible();
  await expect(feedback).toHaveText(/Invalid promo code/i);
  await expect(page.locator('#summary-discount-row')).toBeHidden();
  await expect(page.locator('#order-total')).toHaveText('₹500');
});

// ─────────────────────────────────────────────────────────────
// TC-16: Invalid email format blocks checkout and displays error
// ─────────────────────────────────────────────────────────────
test('TC-16: Invalid email format blocks checkout and displays field error', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Product A to cart' }).click();
  await page.fill('#customer-name', 'Valid Customer');
  await page.fill('#customer-email', 'invalid-email');

  await page.getByRole('button', { name: 'Place your order' }).click();
  await expect(page.locator('#confirmation-overlay')).toBeHidden();

  const emailError = page.locator('#email-error');
  await expect(emailError).toBeVisible();
  await expect(emailError).toHaveText('Please enter a valid email address.');
});

// ─────────────────────────────────────────────────────────────
// TC-17: Invalid phone format blocks checkout and displays error
// ─────────────────────────────────────────────────────────────
test('TC-17: Invalid phone format blocks checkout and displays field error', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Product A to cart' }).click();
  await page.fill('#customer-name', 'Valid Customer');
  await page.fill('#customer-phone', '12345');

  await page.getByRole('button', { name: 'Place your order' }).click();
  await expect(page.locator('#confirmation-overlay')).toBeHidden();

  const phoneError = page.locator('#phone-error');
  await expect(phoneError).toBeVisible();
  await expect(phoneError).toHaveText('Please enter a valid 10-digit mobile number.');
});

// ─────────────────────────────────────────────────────────────
// TC-18: Invalid PIN code format blocks checkout and displays error
// ─────────────────────────────────────────────────────────────
test('TC-18: Invalid PIN code format blocks checkout and displays field error', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Product A to cart' }).click();
  await page.fill('#customer-name', 'Valid Customer');
  await page.fill('#delivery-pin', '5600');

  await page.getByRole('button', { name: 'Place your order' }).click();
  await expect(page.locator('#confirmation-overlay')).toBeHidden();

  const pinError = page.locator('#pin-error');
  await expect(pinError).toBeVisible();
  await expect(pinError).toHaveText('Please enter a valid 6-digit PIN code.');
});

// ─────────────────────────────────────────────────────────────
// TC-19: Clear cart button empties shopping bag and resets badges
// ─────────────────────────────────────────────────────────────
test('TC-19: Clear cart button empties shopping bag and resets badges', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Product A to cart' }).click();
  await page.getByRole('button', { name: 'Add Product B to cart' }).click();
  await expect(page.locator('#cart-count')).toHaveText('2');

  await page.locator('#clear-cart-btn').click();
  await expect(page.locator('#cart-empty')).toBeVisible();
  await expect(page.locator('#cart-count')).toHaveText('0');
  await expect(page.locator('#header-cart-badge')).toHaveText('0');
  await expect(page.locator('#cart-summary')).toBeHidden();
});

// ─────────────────────────────────────────────────────────────
// TC-20: Newsletter email subscription validates inputs
// ─────────────────────────────────────────────────────────────
test('TC-20: Newsletter email subscription validates inputs and displays feedback', async ({ page }) => {
  const newsletterInput = page.locator('#newsletter-email');
  const submitBtn = page.locator('#newsletter-submit-btn');
  const errorEl = page.locator('#newsletter-error');
  const successEl = page.locator('#newsletter-success');

  // 1. Submit empty email
  await submitBtn.click();
  await expect(errorEl).toBeVisible();
  await expect(errorEl).toHaveText('Please enter your email address.');

  // 2. Submit invalid email
  await newsletterInput.fill('invalid');
  await submitBtn.click();
  await expect(errorEl).toBeVisible();
  await expect(errorEl).toHaveText('Please enter a valid email address.');

  // 3. Submit valid email
  await newsletterInput.fill('patron@aurabotanica.com');
  await submitBtn.click();
  await expect(errorEl).toBeHidden();
  await expect(successEl).toBeVisible();
  await expect(successEl).toHaveText(/Welcome to the circle/i);
});

// ─────────────────────────────────────────────────────────────
// TC-21: Keyboard Escape key closes Quick View modal
// ─────────────────────────────────────────────────────────────
test('TC-21: Keyboard Escape key closes Quick View modal', async ({ page }) => {
  const quickViewBtn = page.locator('.card-quick-view-btn[data-product-id="B"]');
  await quickViewBtn.click({ force: true });

  const modal = page.locator('#quick-view-overlay');
  await expect(modal).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

// ─────────────────────────────────────────────────────────────
// TC-22: Delivery and payment method selection options
// ─────────────────────────────────────────────────────────────
test('TC-22: Delivery and payment method radio options update active state', async ({ page }) => {
  const expressRadio = page.locator('input[name="delivery-method"][value="express"]');
  await expressRadio.check();
  await expect(expressRadio.locator('xpath=..')).toHaveClass(/active/);

  const upiRadio = page.locator('input[name="payment-method"][value="upi"]');
  await upiRadio.check();
  await expect(upiRadio.locator('xpath=..')).toHaveClass(/active/);
});

// ─────────────────────────────────────────────────────────────
// TC-23: Profile icon repeated clicks show only one notification without duplicates
// ─────────────────────────────────────────────────────────────
test('TC-23: Profile icon repeated clicks show only one notification without duplicates', async ({ page }) => {
  const accountBtn = page.locator('.account-btn');
  await expect(accountBtn).toBeVisible();

  // 1. Click once: single notification appears
  await accountBtn.click();
  const toasts = page.locator('.toast');
  await expect(toasts).toHaveCount(1);
  await expect(toasts).toContainText('Demo Profile: Guest Patron (Bengaluru Studio Club)');

  // 2. Click repeatedly (8 times): verify no duplicate stacked notifications
  for (let i = 0; i < 8; i++) {
    await accountBtn.click();
  }

  // Exactly one notification must remain visible
  await expect(toasts).toHaveCount(1);
  await expect(toasts).toContainText('Demo Profile: Guest Patron (Bengaluru Studio Club)');

  // 3. Verify it auto-dismisses and is cleanly removed from DOM
  await expect(toasts).toHaveCount(0, { timeout: 4500 });
});
