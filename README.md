# AURA BOTANICA — Artisanal Living & Mini Checkout

A complete boutique lifestyle e-commerce shopping website and robust automated browser test suite built with **HTML5, Custom CSS3, Vanilla JavaScript (ES6+), Node.js, and Playwright**.

---

## 🌿 1. Boutique Visual Transformation

The application features a warm, editorial boutique lifestyle theme inspired by high-end design ateliers:

- **Warm Ivory (`#F4EFE6`)**: Calming foundation for page backgrounds.
- **Deep Forest Green (`#24352D`)**: High-contrast primary branding, buttons, and titles.
- **Terracotta (`#C47752`)**: Warm accents, badges, and notification highlights.
- **Sage Green (`#D8DFD0`)**: Soft secondary badges, trust pills, and subtle backgrounds.
- **Charcoal (`#272923`)**: Legible, high-contrast editorial body text.
- **Soft Cream (`#FAF8F3`)**: Refined card surfaces and modal dialog backgrounds.

### Typography & Editorial Craft
- **Editorial Headings**: *Cormorant Garamond* (Google Fonts) with serif fallbacks.
- **Clean UI & Body**: *Plus Jakarta Sans* with system-ui fallbacks.
- **Subdued Shadows**: Multi-layered organic shadows (`rgba(36, 53, 45, 0.05)`).
- **Sophisticated Borders**: Crisp 1px borders (`#E6DFD3`) with restrained, mature border radii.

---

## 🛍️ 2. Core Features

### Navigation & Discovery
- **Top Announcement Bar**: Displays promotional dispatches, batch notes, and demo coupon information.
- **Header Navigation**: Monogram branding, navigation links (*Home, Shop, Categories, New Arrivals, Values*), live search bar, wishlist button with counter badge, shopping bag indicator, and profile icon.
- **Hero Banner**: Artisanal headline (*"Conscious Craft & Mindful Living"*), explore CTA, and craft badges.
- **Customer Pillars**: 4 trust badges (*Pure Artisanal Craft, Complimentary Shipping, 30-Day Guarantee, Safe Demo Checkout*).
- **Catalog Controls**: Real-time product search, category pills (*All, Acoustics, Living*), and price sorting (*Price: Low to High, High to Low*).

### The Two Synthetic Products
1. **Product A — ₹500**  
   *Walnut Acoustic Studio Headset* &bull; Handcrafted wireless acoustic gear with organic walnut earcups, precision active noise isolation, and breathable memory foam.  
   - Rating: ★ 4.9 (142 reviews &bull; Demo)  
   - Badge: Best Seller &bull; In Stock (14 left)
2. **Product B — ₹300**  
   *Terracotta Smart Organizer Pack* &bull; Essential daily organizer pack woven from organic canvas with terracotta finishes, magnetic clasps, and modular gear dividers.  
   - Rating: ★ 4.8 (98 reviews &bull; Demo)  
   - Badge: Popular Choice &bull; In Stock (28 left)

### Advanced Shopping Bag
- Add to bag from cards or Quick View modal.
- Real-time line item quantity steppers (`+` and `−`).
- Instant line total calculations (`item.price * qty`).
- Clear cart option and continue exploring links.
- Interactive coupon code input (*BOTANICAL* demo coupon).
- Empty bag vector illustration state.
- Floating toast notifications on add, remove, and wishlist updates.
- **Zero-Drift Calculations**: Exact math preserved: Product A (qty: 2) + Product B (qty: 1) = **₹1300**.

### Enhanced Checkout Experience
- **Checkout Progress Stepper**: 4 stages (*Bag, Details, Payment, Confirm*).
- **Customer Information**: Customer full name (**required**), email, and mobile phone.
- **Shipping Destination**: Address, City, State, PIN Code, and Delivery Pace options (*Standard Free, Express Courier*).
- **Payment Method (Demo Only)**: Cash on Delivery, Instant UPI, and Simulated Card UI.
- **Security & Duplicate Protection**: Immediate button lock preventing repeated rapid clicks.
- **Validation**: Floating error banner on empty bag checkout and inline field-level errors.

### Order Confirmation Receipt
- High-end modal dialog displaying:
  - Success seal and *"Order Confirmed!"* heading.
  - Unique order reference number (`ORD-XXXX-XXXX`).
  - Customer name and total amount paid.
  - Formatted date & time with delivery estimate date.
  - **Print Receipt** action (`window.print()`) with print stylesheet.
  - **Start New Order** reset button.

### Client-Side Persistence
- Shopping bag items persist in `localStorage` across page reloads.
- Wishlist items and counter persist in `localStorage`.

---

## 💻 3. Technologies Used

| Layer | Technology |
|---|---|
| **Structure** | Semantic HTML5 (WAI-ARIA accessible) |
| **Styling** | Modern CSS3 (Variables, CSS Grid, Flexbox, Keyframes, `@media print`) |
| **Typography** | Cormorant Garamond & Plus Jakarta Sans (Google Fonts) |
| **Client-Side Logic** | Vanilla JavaScript (ES6+ Maps, Sets, LocalStorage, Event Delegation) |
| **Test Automation** | Playwright (`@playwright/test` v1.49+) |
| **Local Web Server** | `serve` (npm package) |

---

## ⚡ 4. Installation & Quick Start (Windows PowerShell)

### Prerequisites
- Node.js v18 or later: https://nodejs.org/
- npm (bundled with Node.js)

Verify setup:
```powershell
node -v
npm -v
```

### Installation
```powershell
# 1. Navigate to the project directory
cd "C:\Users\Monika Srinithi\Projects\mini-checkout"

# 2. Install dependencies (Playwright + serve)
npm install

# 3. Install Playwright browser binaries
npx playwright install chromium
```

### Running the Application
```powershell
cd "C:\Users\Monika Srinithi\Projects\mini-checkout"
npx serve . -l 3000
```
Open **http://localhost:3000** in your browser.  
*(You can also double click `index.html` to preview directly in your browser).*

---

## 🧪 5. Executing Playwright Tests

```powershell
cd "C:\Users\Monika Srinithi\Projects\mini-checkout"

# Run all 11 automated test cases (headless)
npm test

# Run with visible browser window
npm run test:headed

# Open the interactive HTML test report
npm run test:report
```

### Test Suite Overview (11/11 PASS)
- **TC-01:** Successful checkout shows confirmation and order reference
- **TC-02:** Checkout blocked and cart preserved when customer name is blank
- **TC-03:** Quantity changes update line totals and order total correctly (₹1300)
- **TC-04:** Checkout blocked when cart is empty
- **TC-05:** Rapid double-click on Place Order generates only one confirmation
- **TC-06:** Live Product Search dynamically filters catalog
- **TC-07:** Wishlist toggles and updates badge count
- **TC-08:** Shopping Cart persists in localStorage across page reload
- **TC-09:** Removing product from cart updates order total and line items
- **TC-10:** Quick View Product Modal displays specs and allows adding to bag
- **TC-11:** Mobile viewport renders responsive navigation and cards

---

## 📸 6. Genuine Browser Screenshots

Screenshots captured from live Chromium sessions are stored in `screenshots/`:

1. `01-homepage-hero.png` — Announcement bar, boutique navigation, and editorial hero banner
2. `02-curated-products.png` — Curated essentials catalog with filter pills and ratings
3. `03-quick-view-modal.png` — Quick View product detail modal with specs
4. `04-shopping-bag-populated.png` — Populated shopping bag showing Product A (qty: 2) + Product B = ₹1300
5. `05-checkout-form.png` — Multi-section checkout with delivery and payment methods
6. `06-order-confirmation.png` — Order confirmation receipt with unique `ORD-...` reference
7. `07-mobile-responsive.png` — Full mobile responsive view on iPhone 13 viewport (390px)

To regenerate all screenshots:
```powershell
node capture-screenshots.js
```

---

## 📁 7. Project Structure

```
mini-checkout/
│
├── index.html                 ← Premium boutique shopping website markup
├── style.css                  ← Editorial CSS styles, variables & print styles
├── script.js                  ← Core cart logic, persistence, search & UI state
├── capture-screenshots.js     ← Script to capture real browser snapshots
├── package.json               ← Project metadata & npm test commands
├── playwright.config.js       ← Playwright configuration with automated webServer
│
├── tests/
│   └── checkout.spec.js       ← Complete 11-test Playwright automation suite
│
├── screenshots/               ← Real browser screenshots
│   ├── 01-homepage-hero.png
│   ├── 02-curated-products.png
│   ├── 03-quick-view-modal.png
│   ├── 04-shopping-bag-populated.png
│   ├── 05-checkout-form.png
│   ├── 06-order-confirmation.png
│   └── 07-mobile-responsive.png
│
├── playwright-report/         ← Generated interactive HTML report
├── test-results/              ← Test run artifacts
│
├── README.md                  ← Comprehensive documentation
├── TEST_PLAN.md               ← Detailed QA test plan & specifications
└── TEST_RESULTS.md            ← Actual execution log & test breakdown
```
