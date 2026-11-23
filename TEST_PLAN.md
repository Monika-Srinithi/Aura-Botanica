# TEST_PLAN.md — Aura Botanica / Mini Checkout Complete Functionality Audit Plan

**Document Version:** 3.0 (Comprehensive Functionality Audit & Test Automation Matrix)  
**Project:** Aura Botanica (Mini Checkout Boutique)  
**Location:** `C:\Users\Monika Srinithi\Projects\mini-checkout\`  
**QA Lead:** Senior QA Automation Engineer, Full-Stack Developer & Software Testing Specialist  

---

## 1. Test Objective

Perform a **complete functionality audit** of the Aura Botanica e-commerce application to verify that **every visible element, button, link, form, control, interaction, calculation, and user flow** works correctly, reliably, and without regressions.

### Core Non-Negotiable Business Rules & Verification Points
1. **Fixed Catalog Pricing**:
   - Product A (Walnut Acoustic Studio Headset) = **₹500**
   - Product B (Terracotta Smart Organizer Pack) = **₹300**
   - Combined calculation: Product A (qty: 2 = ₹1000) + Product B (qty: 1 = ₹300) = **₹1300** exactly.
2. **Strict Validation & Error Handling**:
   - Prevent checkout when customer name is blank; display inline error `Customer name is required.` and preserve cart state.
   - Prevent checkout when shopping cart is empty; display validation banner and preserve customer name.
   - Format validation on optional fields when entered: email address syntax (`user@domain.com`), 10-digit mobile phone number, 6-digit PIN code.
   - Allow successful checkout when optional fields are left blank (preserving compatibility with baseline tests).
3. **Idempotency & Duplicate Order Guard**:
   - Prevent duplicate order creation on rapid double-clicking of the Place Order button via boolean state lock and instant button disabling.
   - Generate a single unique order reference matching `/^ORD-[A-Z0-9]+-[A-Z0-9]+$/`.
4. **Promotional Coupon System**:
   - Valid codes: `BOTANICAL` and `WELCOME10` provide a verified 10% discount (`Math.round(subtotal * 0.10)`).
   - Dynamic update of Order Total (`subtotal - discount`).
   - Duplicate coupon application guard (`Coupon "..." is already applied.`).
   - Coupon removal restores exact subtotal.
   - Clearing cart or removing all items resets coupon state.
5. **Client-Side Persistence & State Restoration**:
   - Cart items, quantities, and line totals persist across browser reloads via `localStorage`.
   - Wishlist toggles persist across page reloads via `localStorage`.
6. **Modal & Keyboard Accessibility**:
   - Quick View modal opens with full product metadata, specs, and add-to-bag action.
   - `Escape` key dismisses open modal overlays.
   - Enforce `[hidden] { display: none !important; }` to eliminate pointer-event intercept bugs (DEF-001).
7. **Newsletter Subscription**:
   - Validates empty submissions and invalid email formats with dedicated error messages.
   - Displays confirmation banner and feedback toast on successful subscription.

---

## 2. Complete Inventory of Website Elements

| Section | Element Name | Selector / DOM Path | Element Type | Expected Behavior | Validation Method |
|---|---|---|---|---|---|
| **Header** | Announcement Bar | `.top-bar` | Informational | Displays complimentary shipping offer and dispatch notice | Visual / Text assertion |
| **Header** | Mobile Menu Toggle | `#mobile-menu-btn` | Button | Toggles collapsible navigation drawer on viewports <= 768px | Playwright click & visibility |
| **Header** | Brand Identity Link | `.brand-link` | Anchor link | Scrolls smoothly to top of page, activates Home nav link | Playwright click & scroll check |
| **Header** | Primary Nav: Home | `.nav-link[href="#hero-section"]` | Navigation link | Scrolls to Hero section, sets active class | Playwright click & class assertion |
| **Header** | Primary Nav: Shop | `.nav-link[href="#products-section"]` | Navigation link | Scrolls to Catalog section, sets active class | Playwright click & class assertion |
| **Header** | Primary Nav: Categories | `.nav-link[href="#products-section"]` | Navigation link | Scrolls to Category filters, sets active class | Playwright click & class assertion |
| **Header** | Primary Nav: New Arrivals | `.nav-link[href="#products-section"]` | Navigation link | Scrolls to Curated Essentials, sets active class | Playwright click & class assertion |
| **Header** | Primary Nav: Values | `.nav-link[href="#benefits-section"]` | Navigation link | Scrolls to Philosophy/Values, sets active class | Playwright click & class assertion |
| **Header** | Search Input | `#search-input` | Search input | Filters catalog cards in real time; hides non-matching items | Playwright input & card visibility |
| **Header** | Header Divider | `.header-divider` | Layout separator | Subtle 1px vertical hairline dividing search from user utilities | Visual inspection |
| **Header** | Wishlist Trigger | `#nav-wishlist-btn` | Button | Displays badge count; clicking shows toast summary of saved items | Playwright click & toast check |
| **Header** | Wishlist Badge | `#wishlist-count` | Counter badge | Shows active wishlist item count (0, 1, 2) | Text assertion |
| **Header** | Shopping Bag Trigger | `#nav-cart-btn` | Anchor link | Scrolls to `#cart-section`; displays animated badge count | Playwright click & scroll check |
| **Header** | Header Cart Badge | `#header-cart-badge` | Counter badge | Synchronously matches total item units in cart; bumps on update | Text assertion & bump class |
| **Header** | Account Profile Button | `.account-btn` | Button | Shows demo patron profile toast feedback | Playwright click & toast check |
| **Hero** | Hero Primary CTA | `.btn-hero-primary` | Anchor link | Scrolls to `#products-section` | Playwright click & scroll check |
| **Hero** | Hero Secondary CTA | `.btn-hero-secondary` | Anchor link | Scrolls to `#benefits-section` | Playwright click & scroll check |
| **Hero** | Botanical Artwork | `.hero-svg` | Vector graphic | Renders stylized ceramic vase and organic flora | Visual / DOM check |
| **Hero** | Limited Batch Badge | `g[transform]` | Graphic badge | Displays "LIMITED BATCH — Artisanal No. 42" callout | Visual / DOM check |
| **Values** | Benefit Cards (x4) | `.benefit-item` | Informational cards | Display Sustainable Delivery, Craft Guarantee, Aesthetic Trial, Carbon Offset | DOM structure & text check |
| **Catalog** | Category Filter: All | `.cat-pill[data-category="all"]` | Filter button | Displays all products in catalog | Playwright click & count check |
| **Catalog** | Category Filter: Acoustic | `.cat-pill[data-category="audio"]` | Filter button | Shows Product A; hides Product B | Playwright click & card check |
| **Catalog** | Category Filter: Mindful | `.cat-pill[data-category="lifestyle"]` | Filter button | Shows Product B; hides Product A | Playwright click & card check |
| **Catalog** | Sort Selector | `#sort-select` | Select dropdown | Reorders cards: Featured, Price Ascending, Price Descending | Select change & DOM order check |
| **Catalog** | Search Status Bar | `#search-status` | Feedback container | Informs user of count of matching products | Text & visibility assertion |
| **Products** | Product A Card | `.product-card[data-product-id="A"]` | Product Card | ₹500 fixed price, Acoustic Living, stock status, ratings, perks | Visual & selector check |
| **Products** | Product B Card | `.product-card[data-product-id="B"]` | Product Card | ₹300 fixed price, Mindful Living, stock status, ratings, perks | Visual & selector check |
| **Products** | Wishlist Heart Toggle | `.card-wishlist-btn` | Button | Toggles active class, increments/decrements header counter, updates localStorage | Playwright click & state check |
| **Products** | Quick View Trigger | `.card-quick-view-btn` | Button | Opens Quick View product modal overlay | Playwright click & modal visibility |
| **Products** | Add to Cart Button A | `.btn-add[data-product-id="A"]` | Button | Adds Product A to cart; line total ₹500; badge increments; toast appears | Playwright click & cart check |
| **Products** | Add to Cart Button B | `.btn-add[data-product-id="B"]` | Button | Adds Product B to cart; line total ₹300; badge increments; toast appears | Playwright click & cart check |
| **Cart** | Cart Header Badge | `#cart-count` | Counter badge | Displays total quantity of items in bag | Text assertion |
| **Cart** | Clear Cart Button | `#clear-cart-btn` | Button | Clears all items, resets total to ₹0, shows empty state | Playwright click & empty check |
| **Cart** | Empty Cart State | `#cart-empty` | Illustration state | Shown when cart.size === 0; hidden when cart has items | Visibility assertion |
| **Cart** | Empty Cart CTA | `.btn-empty-cta` | Anchor link | Scrolls back to `#products-section` | Playwright click & scroll check |
| **Cart** | Cart Items List | `#cart-list` | Dynamic list | Renders 2x2 grid for each item: info, line total, steppers, remove | DOM verification |
| **Cart** | Quantity Increase (+) | `.btn-increase` | Stepper button | Increments item qty, recalculates line total and order total | Playwright click & text check |
| **Cart** | Quantity Decrease (−) | `.btn-decrease` | Stepper button | Decrements qty; removes item if qty reaches 0 | Playwright click & text check |
| **Cart** | Line Total Amount | `.line-total-amount` | Calculated text | Exactly `price * qty` for each item | Text assertion |
| **Cart** | Item Remove Button | `.btn-remove` | Button | Deletes item from cart, updates total and badge count | Playwright click & deletion check |
| **Cart** | Items Subtotal | `#summary-subtotal` | Calculated text | Sum of all line totals | Text assertion |
| **Cart** | Free Shipping Callout | `.shipping-free` | Badge | Shows complimentary shipping status | Text assertion |
| **Cart** | Promotional Discount Row | `#summary-discount-row` | Summary row | Hidden by default; visible when coupon applied; shows discount value | Visibility & text check |
| **Cart** | Coupon Code Input | `#coupon-input` | Text input | Accepts promo code (e.g. `BOTANICAL`, `WELCOME10`) | Playwright fill & text check |
| **Cart** | Apply Coupon Button | `#apply-coupon-btn` | Button | Validates code, applies 10% discount, shows feedback | Playwright click & discount check |
| **Cart** | Remove Coupon Button | `#remove-coupon-btn` | Button | Removes active discount, restores original total | Playwright click & total check |
| **Cart** | Coupon Feedback | `#coupon-feedback` | Status message | Shows success confirmation or invalid code error | Text & visibility assertion |
| **Cart** | Prominent Order Total | `#order-total` | High-contrast callout | Exact final payable total (`subtotal - discount`) | Text assertion |
| **Cart** | Continue Shopping Link | `.continue-shopping-link` | Anchor link | Scrolls to `#products-section` | Playwright click & scroll check |
| **Checkout** | Customer Name (Required) | `#customer-name` | Text input | Required customer name; triggers error when blank | Playwright fill & validation check |
| **Checkout** | Name Error Message | `#name-error` | Validation message | Displays `Customer name is required.` | Text & aria-live assertion |
| **Checkout** | Customer Email (Optional) | `#customer-email` | Email input | Optional; validates standard email regex if entered | Playwright fill & regex test |
| **Checkout** | Email Error Message | `#email-error` | Validation message | Displays `Please enter a valid email address.` | Text & visibility assertion |
| **Checkout** | Customer Phone (Optional) | `#customer-phone` | Tel input | Optional; validates 10+ digits if entered | Playwright fill & length test |
| **Checkout** | Phone Error Message | `#phone-error` | Validation message | Displays `Please enter a valid 10-digit mobile number.` | Text & visibility assertion |
| **Checkout** | Street Address | `#delivery-address` | Text input | Shipping address field | Input check |
| **Checkout** | Delivery City | `#delivery-city` | Text input | City field | Input check |
| **Checkout** | Delivery State | `#delivery-state` | Text input | State field | Input check |
| **Checkout** | Delivery PIN Code | `#delivery-pin` | Text input | Optional; validates 6-digit numeric pattern if entered | Playwright fill & pattern test |
| **Checkout** | PIN Error Message | `#pin-error` | Validation message | Displays `Please enter a valid 6-digit PIN code.` | Text & visibility assertion |
| **Checkout** | Delivery Pace Radios | `input[name="delivery-method"]` | Radio group | Standard (Free) vs Artisanal Express (Demo Free) | Radio check & active class |
| **Checkout** | Payment Method Radios | `input[name="payment-method"]` | Radio group | Cash on Delivery, Instant UPI, Credit/Debit Card | Radio check & active class |
| **Checkout** | Security Guarantee | `.security-guarantee` | Informational | 256-Bit Encrypted Safe Checkout note | Text assertion |
| **Checkout** | Validation Banner | `#validation-banner` | Alert banner | Appears when empty cart checkout attempted | Visibility & message check |
| **Checkout** | Place Order Button | `#place-order-btn` | Submit button | Submits order; disables immediately; prevents duplicate orders | Playwright click & disabled check |
| **Receipt Modal** | Overlay Backdrop | `#confirmation-overlay` | Modal dialog | Hidden by default; visible after successful checkout | Visibility & aria-modal check |
| **Receipt Modal** | Order Confirmation Title | `#confirmation-title` | Heading | Displays "Order Confirmed!" | Text assertion |
| **Receipt Modal** | Customer Name Receipt | `#conf-customer-name` | Text display | Exactly matches entered customer name | Text assertion |
| **Receipt Modal** | Order Reference Badge | `#conf-order-ref` | Receipt code | Unique reference matching `/^ORD-[A-Z0-9]+-[A-Z0-9]+$/` | Regex assertion |
| **Receipt Modal** | Total Paid Display | `#conf-total` | Receipt total | Matches final order total | Text assertion |
| **Receipt Modal** | Date & Time Stamp | `#conf-datetime` | Receipt date | Localized timestamp of order placement | DOM / Text check |
| **Receipt Modal** | Estimated Delivery | `#conf-est-delivery` | Receipt delivery | Delivery window estimate | DOM / Text check |
| **Receipt Modal** | Print Receipt Button | `#print-receipt-btn` | Button | Triggers browser `window.print()` | Playwright click handler test |
| **Receipt Modal** | Start New Order Button | `#new-order-btn` | Button | Clears cart, resets form, closes modal, restores ready state | Playwright click & reset test |
| **Quick View** | Quick View Overlay | `#quick-view-overlay` | Modal dialog | Opens with product artwork, title, price, description, specs | Visibility & contents check |
| **Quick View** | Close Modal Button | `#close-quick-view-btn` | Button | Closes Quick View modal | Playwright click & hidden check |
| **Quick View** | Modal Add to Bag CTA | `#quick-view-add-btn` | Button | Adds active product to cart and closes modal | Playwright click & cart check |
| **Newsletter** | Newsletter Email Input | `#newsletter-email` | Email input | Email field for The Aura Dispatch | Playwright fill test |
| **Newsletter** | Newsletter Submit CTA | `#newsletter-submit-btn` | Submit button | Validates email syntax; shows error or success message | Playwright click & validation test |
| **Newsletter** | Newsletter Error Text | `#newsletter-error` | Error message | Displays validation error on empty or invalid email | Text & visibility assertion |
| **Newsletter** | Newsletter Success Banner | `#newsletter-success` | Success message | Displays welcome confirmation on valid email | Text & visibility assertion |
| **Footer** | Collection & Care Links | `.footer-links a` | Anchor links | Navigates to corresponding sections | Playwright click & scroll check |
| **Footer** | Legal Links (x3) | `.legal-links a` | Anchor links | Privacy Code, Terms of Pure Commerce, Accessibility; show demo toast | Playwright click & toast check |
| **Toast** | Floating Toast Container | `#toast-container` | Notification region | Animates temporary floating toast notifications | DOM creation & auto-remove check |

---

## 3. Playwright Automated Test Matrix (22 Comprehensive Test Cases)

| Test ID | Test Title | Test Type | Priority | Target Element / Feature | Expected Outcome |
|---|---|---|---|---|---|
| **TC-01** | Successful checkout shows confirmation & order reference | Positive Flow | P0 | Place Order CTA, Confirmation Modal | Order confirmed, `ORD-...` generated, customer name & ₹500 total displayed. |
| **TC-02** | Checkout blocked and cart preserved when name is blank | Negative Flow | P0 | Required `#customer-name` field | Modal hidden, `#name-error` visible, cart preserved with 1 item. |
| **TC-03** | Quantity changes update line totals and order total (₹1300) | Calculation | P0 | Quantity steppers (`+`, `−`), Line Totals | Product A line total ₹1000 (qty 2), Product B ₹300, final total ₹1300. |
| **TC-04** | Checkout blocked when cart is empty | Negative Flow | P0 | Validation banner, Empty cart state | Modal hidden, `#validation-banner` visible, cart count reads 0. |
| **TC-05** | Rapid double-click on Place Order generates only one confirmation | Idempotency | P0 | Duplicate submission guard | `#place-order-btn` disabled immediately; exactly 1 modal and 1 reference. |
| **TC-06** | Live Product Search dynamically filters catalog | Interaction | P1 | `#search-input`, `.product-card` | Matching card visible, non-matching card hidden; search clear restores all. |
| **TC-07** | Wishlist toggles and updates badge count | Persistence | P1 | `.card-wishlist-btn`, `#wishlist-count` | Heart button toggles `.active`, counter increments to 1 then decrements to 0. |
| **TC-08** | Shopping Cart persists in localStorage across page reload | Persistence | P1 | `localStorage`, Cart rendering | Item B and ₹300 total preserved after browser `page.reload()`. |
| **TC-09** | Removing product from cart updates order total and line items | Positive Flow | P1 | `.btn-remove`, `#order-total` | Product A removed, Product B remains, total updates from ₹800 to ₹300. |
| **TC-10** | Quick View Product Modal displays specs & adds to bag | Modal / UI | P1 | `#quick-view-overlay`, `#quick-view-add-btn` | Modal displays title, specs, ₹500 price; adding item closes modal and updates bag. |
| **TC-11** | Mobile viewport renders responsive navigation and cards | Responsive | P1 | Viewport 390x844 (iPhone 13) | `#mobile-menu-btn` visible, product cards and checkout stack cleanly without overflow. |
| **TC-12** | Promotional coupon discount calculation (`BOTANICAL`) | Calculation | P0 | `#coupon-input`, `#apply-coupon-btn`, `#summary-discount` | 10% discount (-₹50 on ₹500) applied; `#order-total` updates to ₹450. |
| **TC-13** | Re-applying active coupon is guarded against duplication | Edge Case | P1 | `#apply-coupon-btn`, Duplicate guard | Feedback warns code already applied; total remains ₹450 without double discounting. |
| **TC-14** | Removing promo coupon restores standard subtotal | Positive Flow | P1 | `#remove-coupon-btn`, Discount row | Discount row hidden, remove button hidden, total restored to ₹500. |
| **TC-15** | Invalid promo code displays error without applying discount | Negative Flow | P1 | `#coupon-feedback`, `#order-total` | Error message displayed, discount row remains hidden, total stays ₹500. |
| **TC-16** | Invalid email format blocks checkout and displays field error | Negative Flow | P1 | `#customer-email`, `#email-error` | Modal blocked, `#email-error` visible with `Please enter a valid email address.`. |
| **TC-17** | Invalid phone format blocks checkout and displays field error | Negative Flow | P1 | `#customer-phone`, `#phone-error` | Modal blocked, `#phone-error` visible with `Please enter a valid 10-digit mobile number.`. |
| **TC-18** | Invalid PIN code format blocks checkout and displays field error | Negative Flow | P1 | `#delivery-pin`, `#pin-error` | Modal blocked, `#pin-error` visible with `Please enter a valid 6-digit PIN code.`. |
| **TC-19** | Clear cart button empties shopping bag and resets badges | Positive Flow | P1 | `#clear-cart-btn`, `#cart-empty` | Empty state displayed, badge count resets to 0, cart summary hidden. |
| **TC-20** | Newsletter email subscription validates inputs & displays feedback | Form Flow | P1 | `#newsletter-form`, `#newsletter-error`, `#newsletter-success` | Validates empty email, invalid email; confirms subscription with welcome banner. |
| **TC-21** | Keyboard Escape key closes Quick View modal | Accessibility | P1 | Keyboard `Escape`, `#quick-view-overlay` | Pressing `Escape` key closes open modal overlay. |
| **TC-22** | Delivery and payment method radio options update active state | Interaction | P2 | Delivery & Payment radio inputs | Selected radio wraps receive `.active` highlight styling and toast feedback. |
| **TC-23** | Profile icon repeated clicks show only one notification without duplicates | Bug Fix / Flow | P1 | `.account-btn`, `.toast`, `showToast` | Single notification shown; repeated clicks refresh without duplicating; auto-dismisses and cleans from DOM. |

---

## 4. Test Environment & Execution Details

- **Test Framework:** Playwright v1.49+
- **Browser Tested:** Chromium Headless & Headed
- **Execution URL:** `http://localhost:3000` (served via `npx serve . -l 3000`)
- **Navigation Setting:** `{ waitUntil: 'domcontentloaded' }` with `.site-header` visibility assertion
- **Headless Screen Capture Viewports:**
  - Desktop: 1440 × 900
  - Laptop: 1366 × 768
  - Tablet: 768 × 1024
  - Mobile: 390 × 844
