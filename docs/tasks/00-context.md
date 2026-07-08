# Account Portal — Shared Context (read before any task)

Full spec = `../account-portal-plan.md` + repo `CLAUDE.md`. This file is the condensed shared context every task references.

## Goal
Build a custom **Account Portal / My Account** for the Wandering Bear Shopify theme, per Figma (`WB-x-AW-Account-Portal`), on **Legacy (classic) customer accounts (Liquid)**. Senior Shopify frontend, Shopify standards, responsive (mobile + desktop).

## ⛔ Golden rules
- **English only.** All code, comments, commits, branch names, docs, schema labels, locale values, and identifiers are in English. No exceptions.
- **Never push to live.** Dev only via `shopify theme dev` (unpublished dev theme). Push/publish/deploy are blocked in `.claude/settings.local.json`.
- **Never expose API keys client-side.** Third-party data (Inveterate/Stay AI) goes through the worker only.
- **Source of truth** for this project = `CLAUDE.md` + `../account-portal-plan.md` (this session owns them).

## Stack
Shopify OS 2.0 · Liquid · Vite 8 (`vite-plugin-shopify`) · Tailwind v4 (CSS `@theme`) · Alpine.js (lazy, interaction-gated) · Swiper. Dev: `npm run dev`.

## Integrations (3 pillars)
| Pillar | Tool | Native or worker |
|---|---|---|
| Account, orders, addresses | Shopify Legacy accounts | **Native Liquid** (`customer`, `customer.orders`, `order.*`) |
| Membership tier + credits **balance** | **Inveterate** | **Native Liquid** (`customer.tags` `inveterate-tier#…`, `customer.metafields.inveterate.credits_earned`) |
| Progress-to-next-tier, credit history/redemption | **Inveterate API** | **Worker** `/apps/wb/membership`, `/apps/wb/credits` |
| Subscriptions / autoship, edit/cancel | **Stay AI (Retextion)** | **Worker** `/apps/wb/subscriptions` + Stay AI customer portal |

Inveterate tier codes: `c4057f2f`=FREE · `72ccf378`=VIP · `dc38b982`/`99a431e2`=ELITE.

## Worker = Part B (secure exchange)
One Cloudflare Worker behind one Shopify App Proxy (`/apps/wb/*`). Keys server-side only. Every request: verify App Proxy HMAC `signature` → trust `logged_in_customer_id` only → scope query server-side → minimized JSON response. Frontend consumes via same-origin `fetch('/apps/wb/…')` and **mocks the contract until the worker ships**.

## Conventions (mandatory)
- **Legacy accounts:** ⚠️ base theme ships NEW-accounts markup (`snippets/header-actions.liquid`); mode must be switched to Legacy in Admin → Settings → Customer accounts (not detectable from Liquid). Confirmed by client.
- **Sections-first:** screen content in `sections/*.liquid` with `{% schema %}`; `templates/customers/*.liquid` = thin `{% section %}` wrapper.
- **AW styling:** Tailwind `!` / `md:!` modifiers, typo classes `.h1–.h5/.body`, inline `{{ color_scheme.settings.* }}`, brand vars (`--color-espresso/-gold/...`).
  - ⚠️ **Gotcha:** `grid-cols-1` is NOT in the compiled Tailwind build (only `grid-cols-2`+). Use `flex flex-col md:!flex-row` (theme idiom) for single→multi-column layouts instead of `grid grid-cols-1 md:!grid-cols-2`.
- **Reuse snippets:** `picture`, `wb-button`, `tooltip`, `accordion`, `icons`, `membership-widget`.
- **JS:** Alpine plugins in `frontend/scripts/components/*.ts` + register in `frontend/entrypoints/main.js`. `x-cloak` to avoid FOUC.
- **Text via locales** (`locales/en.default.json`, `customer.*`). Money via money filters.
  - ⚠️ **Gotcha:** the `t` filter is NOT evaluated inside `{% render %}` arguments (renders the raw key). Assign the translated string to a variable in a `{% liquid %}` block first, then pass the variable: `assign t_x = 'key' | t` → `render 'snip', label: t_x`.
- **Breakpoints (mobile-first):** mobile <750 · tablet `smd:` 750 · desktop `md:` ≥1024.
- **A11y** (semantic, aria, focus, ≥44px targets) + **Theme Check** clean.
- **Forms:** native `{% form %}`; `customer_address` needs a param (`customer.new_address`/`address`); order statuses via `order.financial_status_label`/`fulfillment_status_label`; activate/reset only via email token.

## 🏅 GOLD STANDARD — every account portal page must follow this
1. **Template = thin wrapper.** `templates/customers/<name>.liquid` → `{% section 'customer-<name>' %}`. All logic/markup lives in the section (or a shared snippet).
2. **Structure is always the same shell:** `<section class="w-full" style="background-color: var(--color-brand-beige)"> <div class="account-container py-…"> … </div> </section>`. Forms put their inputs inside `.account-form` (352px); the page heading sits full-width-centered above the form.
3. **Widths come only from the shared classes** — `.account-container` (774px) / `.account-form` (352px) in `components.css`. Never hardcode `max-w-[Npx]` per page.
4. **Data — native first.** Use Liquid for `customer`, `customer.orders`, tier tags, `customer.metafields.inveterate.credits_earned`. Dynamic data (Stay AI subscriptions, Inveterate progress/history) comes from the worker via App Proxy `/apps/wb/*` — API keys never reach the browser.
5. **Text via locales** (`customer.*`) — no hardcoded strings. Money via money filters. Order status via `order.*_status_label` (not raw enums).
6. **Components:** inputs → `customer-input` (352×51, radius 5px); submit → `customer-form-button`; link-buttons → `wb-button`. Buttons are gold `#AF7404`, shadow `4/4/4 25%`, height **43px** (auth) / **40px** (dashboard).
7. **Links underline on hover only** → class `hover-underline` (never Tailwind `hover:underline`).
8. **Known Tailwind-compile gaps in this build — use the safe path:** `t` filter is NOT evaluated inside `{% render %}` args (assign to a var first); `grid-cols-1` missing (use `flex flex-col md:!flex-row`); `hover:underline`, `rotate-[…]`, negative offsets missing (use a custom CSS class or inline `style`).
9. **Mobile-first responsive:** breakpoints `smd:` 750 / `md:` 1024. Tables → cards on mobile. No FOUC (`x-cloak`).
10. **Figma parity:** pull exact tokens from `docs/figma/**/file.json`; compare desktop + mobile + every state (Free/VIP/Elite + empty/error/loading).
11. **A11y** (labels, `aria-*`, focus, ≥44px targets, `alt`) + **`shopify theme check` clean**.
12. **Class naming (Shopify/Dawn BEM).** Don't ship arbitrary-utility soup (`w-[76px] md:!w-[118px]`, `text-[45px]`, `!important` overrides, inline `style=`) in account markup. Anything sized to a Figma token, repeated, or needing `!`/inline hacks → a **named component class** in `frontend/styles/account.css` using `.block__element` naming and theme custom properties (`var(--color-…)`, `var(--font-…)`). Simple layout (`flex`, `grid`, `gap`, `mb-*`) may stay as utilities. Reference implementation: `.contact-cta` / `.contact-cta__card` / `.contact-cta__badge`. Account styles live in `account.css` (imported in `main.js`), not scattered inline.
13. **Guardrails:** never push to live (`shopify theme dev` only) · no AI attribution in commits · English only · source of truth = `CLAUDE.md` + `docs/`.

## Layout containers (single source of truth)
All account pages share two containers, defined ONCE in `frontend/styles/components.css` — never hardcode `max-w-[Npx]` per page:
- **`.account-container`** — content column, **max-width 774px**, centered, `padding-inline: 1rem`. Used by dashboard, order page, credit history, addresses. Pattern: `<section class="w-full" style="background: var(--color-brand-beige)"> <div class="account-container py-…"> … </div> </section>`.
- **`.account-form`** — input/form column, **max-width 352px**, centered. Used by login / register / reset / activate. The page heading sits full-width-centered above it (so long headings like "RESET PASSWORD" don't wrap); the form/inputs go inside `.account-form`.
- To change a width, edit the class in components.css (one place).

## Figma reference & Design QA (run after every task)
Frames are pulled to `docs/figma/<file>/`:
- **`ancillary/`** — file `XKBQXkFlhpPQHn5xx97qjC` (WB x AW Ancillary Pages): **Login, New Account, Reset Password** (+ error/confirmation + `_Mobile`).
- **`account-portal/`** — file `IaDINDvZYnKMfT8nprQZUy` (WB x AW Account Portal): **AccountDashboard_VIP / _Elite / _Free_NoAutoship / _Free_CancelledAutoship**, and **Other Account Pages** (order / credit history / Stay portal).
- Each folder: `frames.md` (index with node-ids), `exports/*.png` (renders), `file.json` (raw nodes for exact tokens).
- Re-pull: `./scripts/figma-pull.sh` with env `FIGMA_FILE_KEY` / `FIGMA_SUBDIR` / `FIGMA_SCALE` (token in `.figma-token`, gitignored). Exact token/spacing for a node: `GET /v1/nodes?ids=<node-id>` or read `file.json`.

**Design-QA procedure — do this before marking any task done:**
1. Open the exact frame(s) for the task — **desktop + mobile + every state variant** (default / error / empty / confirmation).
2. `shopify theme dev` → view the built screen at the frame's breakpoints (desktop, and mobile 375); screenshot.
3. **Side-by-side vs the export:** layout & order, spacing/margins, type scale, colors, radii, borders/shadows, icons, imagery — and every state.
4. **Pull exact tokens from Figma** (hex, font-size, line-height, letter-spacing, spacing, radius) from the node (`file.json` / `GET /v1/nodes`) → map to theme vars / `.h*` / `.body`. Don't eyeball.
5. Responsive re-check at **375 / 750 / 1024**; a11y; `shopify theme check`.
6. **Parity sign-off:** matches desktop + mobile, all state frames covered, tokens match, no FOUC.

## Client doc alignment & backend constraints (2026-07)
Client confirmed the dashboard shows: **next upcoming autoship** (or cancelled), **credits count**, **membership state**, **order history w/ tracking**. Three tiers — **Free / VIP / Elite** — each shifts the membership info. Frames: `Free_NoAutoship`, `Free_CancelledAutoship`, `VIP`, `Elite`. ✅ all four implemented in `snippets/customer-dashboard.liquid` (state model `tier × autoship_state`).

**Confirmed rules:**
- Free & VIP get the **"Upgrade to Elite"** CTA → routes through the **Inveterate update flow** (not just a link to /pages/membership — wire the actual Inveterate flow in Task 02/07).
- **Cancelled autoship state shows ONLY if the customer has no other active autoship** — this is a worker/data derivation rule: `active` if any ACTIVE sub → else `cancelled` if a cancelled sub exists → else `none`.
- **No autoship → credits shown at larger width** (the wide YOUR CREDIT block). ✅
- Other pages (later tasks): **Order page** (from history), **Stay.ai portal** (restyled bg, their widget otherwise as-is), **Credit history** (balance + redemption + redemption history).

**Open (AW to advise):** empty order history — hide the section or show a blank state? Currently a styled empty state is rendered.

**Backend constraints to flag to client (answer to their "restrictions" ask):**
- **Autoship (Stay AI API, via worker + App Proxy).** Design needs per-subscription: bundle/product name ("96oz Bundle—3+Boxes"), next shipment date, line-item flavors (+N more), active count, status. Confirm the API returns line-item product names, a next-charge date, and a bundle label (or we compose it). **PAUSED** subs exist in the API but the design only defines active/cancelled → need a display rule for PAUSED. Cancelled-only-if-no-active requires querying BOTH ACTIVE and CANCELLED.
- **Credits (Inveterate).** The native metafield gives the **balance only**. The design's credit **expiry date**, **history**, and **redemption** are NOT in the metafield → require the **Inveterate Public API** (worker). Confirm Inveterate exposes expiry + history and a redemption endpoint (vs checkout-only).
- **Security/perf.** All third-party keys stay server-side (worker); API latency → consider caching. Frontend mocks the contract until the worker ships.

## Task index
| # | Task | File | Part | Depends on |
|---|---|---|---|---|
| 01 | Auth + initial Dashboard (login, register, forgot/reset pw, dashboard scaffold) | `01-auth-and-dashboard.md` | A | Legacy accounts on |
| 02 | Dashboard states + Membership card (Free/VIP/Elite, tier + progress, credits badge) | `02-dashboard-membership.md` | A | 01, (worker mock) |
| 03 | Order history + Order page (native, tracking) | `03-orders.md` | A | 01 |
| 04 | "Your next autoship order" (Stay AI) + portal page | `04-subscriptions.md` | A | worker/mock |
| 05 | Credit history + redemption (Inveterate) | `05-credits.md` | A | worker/mock |
| 06 | Addresses | `06-addresses.md` | A | 01 |
| 07 | Worker + App Proxy (membership/subscriptions/credits, secure) | `07-worker.md` | B | Shopify app |
| 08 | Locales / Theme Check / a11y / responsive QA | `08-qa.md` | A | all |

Build order: **01 first.** 02/03/06 can follow in parallel; 04/05 need the worker (or mocks); 07 is the Part B track; 08 is the final pass.
