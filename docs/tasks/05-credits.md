# Task 05 — Membership credit history + redemption (Inveterate)

**Read first:** `00-context.md`. **Part A** (UI). Needs **Task 07 worker** for history/redemption — build against the **mock contract** until then.

## Goal
Membership credit history page: current **balance** (native), earn/redeem **history**, and **redemption** — sourced from **Inveterate Public API 2.0** via the worker.

## Files
- `sections/customer-credits.liquid` — balance + redeem + history.
- `frontend/scripts/components/creditRedemption.ts` — redeem flow (reuse `modal.ts` `addToCart`/POST pattern); loading/confirm.

## Spec
- **Balance:** native `customer.metafields.inveterate.credits_earned` (money filter) + explanation (`settings.member_tooltip`).
- **History:** `GET /apps/wb/credits` (worker) → list of `{ date, type: earned|redeemed, amount, order? }`. Table (desktop) ↔ cards (mobile). ⚠️ Confirm exact Inveterate endpoint/fields (open question #3).
- **Redeem:** via Inveterate — worker `POST` if API supports it, else checkout/autoship-management flow. Wire `creditRedemption.ts` accordingly.
- **Empty state** for history.
- **Security:** all API calls through the App-Proxy worker; no key client-side.

## Data
Mock `GET /apps/wb/credits` now; swap to worker in 07.

## Acceptance criteria
- [ ] Balance renders (native); history renders from contract (table↔cards).
- [ ] Redeem flow present (per confirmed Inveterate mechanics); loading/confirm/error.
- [ ] Empty history state; responsive 375/750/1024.
- [ ] Copy via locales; Theme Check clean; a11y.

## Figma parity — ⚠️ no dedicated frame in Figma
- The Account Portal file has **no credit-history page frame**. Only the dashboard **credit card** exists: "**YOUR CREDIT $15**", "Expires 01/01/2028", **REDEEM CREDITS** button, **View Credit History** link (see Task 02 dashboard frames).
- → The credit-history page design is **TBD**. Build to the WB Style Guide, reusing the dashboard credit-card styling + table/card patterns from orders. **Flag to AW** for a dedicated frame; confirm where "View Credit History" links.
- Match the credit card styling exactly from the dashboard frames; follow 00-context Design-QA procedure.

## Verification
Mocks: exercise history + redeem states. Worker (07): confirm real history + a redemption reflects in Inveterate. **Then run the Figma parity check above (against the dashboard credit card + WB guide).**
