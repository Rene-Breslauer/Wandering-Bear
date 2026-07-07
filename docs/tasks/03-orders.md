# Task 03 — Order history + Order page

**Read first:** `00-context.md`. **Part A.** Depends on **01**. Fully **native** (no worker).

## Goal
Order history list (dashboard preview + full page) and the single order detail page, using native Shopify customer/order objects, with tracking links. Responsive (table on desktop → cards on mobile).

## Files
- `templates/customers/order.liquid` → `{% section 'customer-order' %}`.
- `sections/customer-orders.liquid` — full history (pagination) + preview mode (limit N).
- `sections/customer-order.liquid` — single order detail.
- `snippets/customer-order-card.liquid` — row/card for history (with tracking link).
- `snippets/customer-order-status.liquid` — status badge.

## Spec
- **History** — `{% paginate customer.orders by 10 %}`: `order.name`, `order.created_at`, status (`order.financial_status_label` / `order.fulfillment_status_label`), item count, `order.total_price` (money filter), link to order. **Tracking** from `order.fulfillments[].tracking_url`.
- **Order detail** — `order` object: line items (image via `picture`, title, variant, qty, price; subscription badge if `line_item.selling_plan_allocation`), totals (subtotal/discounts/shipping/tax/total), shipping/billing addresses, shipping method, tracking button (`wb-button`).
- **Dashboard preview** — `customer-orders` in preview mode (limit) + "View all".
- **Responsive** — desktop table (`hidden md:!table`) ↔ mobile cards (`md:!hidden`); order detail 2-col desktop (`md:!sticky` summary) ↔ stacked mobile with address accordions (`accordion`).
- **Empty** — `customer-empty-state`.

## Data
100% native Liquid. Use `*_status_label` (localized), not raw enums.

## Acceptance criteria
- [ ] History paginates, shows status + tracking link where fulfilled.
- [ ] Order detail renders items, totals, addresses, tracking; subscription line items badged.
- [ ] Dashboard preview + "View all" works.
- [ ] Responsive 375/750/1024 (table↔cards); empty state.
- [ ] Copy via locales; Theme Check clean; a11y.

## Figma parity (frames — `docs/figma/account-portal/`, board "Other Account Pages")
- Order detail: **Account_Dashboard_IndividualOrder** `1:1162` and `1:1208` (two desktop variants — likely autoship vs one-time); mobile `1:1301` / `1:1338` / `1:1379`.
- Order-history **table** lives on the dashboard frames (Task 02): columns Order · Date · Tracking · Payment status · Fulfillment status · Total, with a "Timeframe: Last 3 Months" dropdown.
- Follow 00-context Design-QA procedure; pull tokens from `account-portal/file.json`.

## Verification
`shopify theme dev`; use an account with real orders (incl. a fulfilled one with tracking and a subscription order); visit `/account`, order history, and an order detail page. **Then run the Figma parity check above.**
