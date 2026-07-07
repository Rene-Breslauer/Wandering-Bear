# Task 02 — Dashboard states + Membership card

**Read first:** `00-context.md`. **Part A.** Depends on **01**; uses worker **mocks** for progress/subscription status.

## Goal
Turn the dashboard scaffold (Task 01) into the full stateful dashboard: **Free / VIP / Elite** states, the **Membership card** ("Your membership tier" + "Progress to next tier"), the **credits badge** (incl. the wide No-autoship layout), and the special states (no-autoship / cancelled autoship / empty).

## Files
- `sections/customer-account-dashboard.liquid` — extend: state logic + module visibility blocks.
- `snippets/customer-membership-card.liquid` — tier + progress bar + CTA.
- `snippets/customer-credits-badge.liquid` — balance badge (compact + wide variants).
- `snippets/customer-empty-state.liquid` — reusable empty/blank state.
- (reuse) `snippets/membership-modal.liquid` + `frontend/scripts/components/modal.ts` for the Elite upsell.

## Spec
- **Tier (native):** from `customer-membership-state` (`membership_level` / `is_elite`).
- **Progress to next tier:** progress bar from `GET /apps/wb/membership` (mock now) → `{ tier, next_tier, metric, current, threshold, remaining, percent }`. Hide for Elite (top tier).
- **States:**
  - **Free** (`Free_NoAutoship` / `Free_CancelledAutoship`): "Start autoship" CTA + Elite upsell. No autoship & no orders → credits badge **wide** (full-width).
  - **VIP** (`AccountDashboard_VIP`): autoship summary + credits + Elite upsell (Inveterate update flow).
  - **Elite** (`AccountDashboard_Elite`): autoship summary + credits, no upsell (or "manage").
  - **Cancelled autoship**: show only if no other active autoship (drive from subscriptions mock).
  - **Empty** (no orders): `customer-empty-state` (copy/CTA — AW to advise).
- **Elite upsell:** reuse `membership-modal` → `addToCart(settings.elite_product variant, 1, selling_plan)`.

## Data
Tier + credits balance = native. Progress + subscription status = worker mocks (contracts in `../account-portal-plan.md` §3). Mark `TODO(worker)`.

## Depends / out of scope
Depends 01. Real subscription block = Task 04; real worker = Task 07. This task styles states against the contracts with mock data.

## Acceptance criteria
- [ ] Each tier (FREE/VIP/ELITE test tag) renders the correct card, CTA, and progress bar (Elite hides progress).
- [ ] No-autoship widens the credits badge; cancelled and empty states render correctly.
- [ ] Elite upsell opens the modal and adds the Elite plan to cart.
- [ ] Responsive 375/750/1024; `x-cloak`, no FOUC.
- [ ] Copy via locales; Theme Check clean.

## Figma parity (frames — `docs/figma/account-portal/`)
- **AccountDashboard_VIP** `1:24` · **_Elite** `1:320` · **_Free_NoAutoship** `1:601` · **_Free_CancelledAutoship** `1:867` (each frame has desktop + mobile columns).
- Observed modules to match: next-autoship card (badge "2 Active Autoships", product lines, "Next shipment", "+N more", **MANAGE UPCOMING ORDERS**) · credit card (**YOUR CREDIT $X**, Expires, **REDEEM CREDITS**, View Credit History) · membership-tier card (What's Included bullets + Membership FAQ) · **Progress to next tier** (bar + "Spend $X more to reach Elite…" + **UPGRADE TO ELITE · $25**) · order-history table · "STILL WANDERING AROUND?" contact CTA.
- Pull exact tokens from `account-portal/file.json`. Follow 00-context Design-QA procedure.

## Verification
`shopify theme dev`; log in with FREE/VIP/ELITE-tagged accounts; toggle mock subscription/progress data to exercise every state. **Then run the Figma parity check above.**
