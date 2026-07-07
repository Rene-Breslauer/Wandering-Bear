# Task 04 — "Your next autoship order" (Stay AI) + Stay.ai portal page

**Read first:** `00-context.md`. **Part A** (UI). Needs **Task 07 worker** for live data — build against the **mock contract** until then.

## Goal
The Figma **"Your next autoship order"** block: show the member's subscription(s) with **edit / cancel** (+ skip/swap/address), plus the dedicated **Stay.ai portal page**. Data from **Stay AI (Retextion)** via the worker; manage via Stay AI's customer portal.

## Files
- `snippets/customer-autoship-summary.liquid` — the "next autoship order" card (dashboard + standalone).
- `sections/customer-stay-portal.liquid` — restyled container hosting the Stay AI customer portal (app block / embed).
- `frontend/scripts/components/subscriptions.ts` — fetch `/apps/wb/subscriptions`, render loading/empty/error; wire manage actions.

## Spec
- **Read (summary):** `GET /apps/wb/subscriptions` → contract in `../account-portal-plan.md` (Data contract): `id, status (ACTIVE|PAUSED|CANCELLED), next_order_date, frequency, line_items[], price, manage_url, can_edit, can_cancel`. Render next order date, items (`picture`), qty, price, frequency, status per Figma.
- **States:** upcoming / cancelled / no-autoship (empty).
- **Manage (edit/cancel/skip/swap/address):**
  1. **Recommended** — route into **Stay AI customer portal** via `manage_url` deep-link / embedded app block.
  2. **Inline** (only if Figma requires) — worker write endpoints; confirm Stay AI write API first.
- **Stay.ai portal page** — embed Stay AI's full customer portal; restyle background only ("everything else remains"). Container responsive.
- **Security:** never call Stay AI from the browser; all reads/writes through the App-Proxy worker (see 07).

## Data
Mock the contract now (inline JSON + loading/empty/error). Swap to live worker in 07.

## Acceptance criteria
- [ ] "Your next autoship order" renders from the contract (upcoming/cancelled/no-autoship).
- [ ] Edit/cancel reachable (portal deep-link or inline per decision).
- [ ] Stay.ai portal page embeds + restyles the portal.
- [ ] Loading/empty/error states; responsive 375/750/1024; no key in client.
- [ ] Copy via locales; Theme Check clean.

## Figma parity (frames — `docs/figma/account-portal/`)
- **Stay.ai portal page:** **Account_Dashboard_Stay.ai** `1:1257` (board "Other Account Pages").
- **"Your next autoship order" card** is shown on the dashboard frames (Task 02): badge "2 Active Autoships" · "96oz Bundle—3+Boxes" · "Next shipment: 07/25/2025" · product flavor lines · "+N more" · **MANAGE UPCOMING ORDERS** button. Match this exactly.
- Follow 00-context Design-QA procedure.

## Verification
With mocks: exercise all states. With worker (07): log in, confirm real subscriptions render and edit/cancel round-trips reflect in Stay AI + Shopify. **Then run the Figma parity check above.**
