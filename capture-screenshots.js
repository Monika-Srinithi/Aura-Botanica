const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const appUrl = pathToFileURL(path.join(__dirname, 'index.html')).href;
  const browser = await chromium.launch();
  
  // 1. Desktop 1440px - Homepage Hero & Brand Header View
  const page1440 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page1440.goto(appUrl);
  await page1440.waitForLoadState('networkidle');
  await page1440.screenshot({ path: path.join(screenshotDir, '01-desktop-1440px-hero.png'), fullPage: false });

  // 2. Laptop 1366px - Curated Products & Discovery Section
  const page1366 = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await page1366.goto(appUrl);
  await page1366.waitForLoadState('networkidle');
  const productsSection = page1366.locator('#products-section');
  await productsSection.scrollIntoViewIfNeeded();
  await page1366.screenshot({ path: path.join(screenshotDir, '02-laptop-1366px-catalog.png') });

  // 3. Desktop - Quick View Product Detail Modal
  const quickViewBtn = page1440.locator('.card-quick-view-btn[data-product-id="A"]');
  await quickViewBtn.click({ force: true });
  await page1440.locator('#quick-view-overlay').waitFor({ state: 'visible' });
  await page1440.screenshot({ path: path.join(screenshotDir, '03-quick-view-modal.png') });
  await page1440.locator('#close-quick-view-btn').click();

  // 4. Desktop - Populated Shopping Bag (Product A qty 2 + Product B = ₹1300)
  await page1440.getByRole('button', { name: 'Add Product A to cart' }).click();
  const itemA = page1440.locator('.cart-item[data-product-id="A"]');
  await itemA.getByRole('button', { name: /Increase quantity of Product A/i }).click();
  await page1440.getByRole('button', { name: 'Add Product B to cart' }).click();
  const cartSection = page1440.locator('#cart-section');
  await cartSection.scrollIntoViewIfNeeded();
  await page1440.screenshot({ path: path.join(screenshotDir, '04-shopping-bag-populated.png') });

  // 5. Desktop - Multi-section Checkout Details Form
  const checkoutSection = page1440.locator('#checkout-section');
  await checkoutSection.scrollIntoViewIfNeeded();
  await page1440.screenshot({ path: path.join(screenshotDir, '05-checkout-form.png') });

  // 6. Desktop - Order Confirmation Receipt Modal
  await page1440.fill('#customer-name', 'Alice Kumar');
  await page1440.getByRole('button', { name: 'Place your order' }).click();
  await page1440.locator('#confirmation-overlay').waitFor({ state: 'visible' });
  await page1440.screenshot({ path: path.join(screenshotDir, '06-order-confirmation.png') });

  // 7. Tablet 768px Viewport
  const tabletPage = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  await tabletPage.goto(appUrl);
  await tabletPage.waitForLoadState('networkidle');
  await tabletPage.getByRole('button', { name: 'Add Product A to cart' }).click();
  await tabletPage.screenshot({ path: path.join(screenshotDir, '07-tablet-768px.png'), fullPage: true });

  // 8. Mobile 390px Viewport (iPhone 13 / 14)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto(appUrl);
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.getByRole('button', { name: 'Add Product A to cart' }).click();
  await mobilePage.screenshot({ path: path.join(screenshotDir, '08-mobile-390px.png'), fullPage: true });

  await browser.close();
  console.log('All 8 genuine screenshots captured successfully across viewports (1440px, 1366px, 768px, 390px) in ' + screenshotDir);
})();
