# Task 01 — Auth pages + initial Dashboard

**Read first:** `00-context.md`. **Part A** (Shopify frontend). No worker needed — dynamic data is mocked.

## Goal
Ship the entry flow of the portal: **login, register, forgot password (request + reset)**, and an **initial Dashboard scaffold** that renders for a logged-in member with the account nav, greeting, membership badge, and placeholder cards wired to the data contracts (mocked). Everything responsive (mobile + desktop), styled to Figma / WB Style Guide, Shopify-standard.

## Scope — files to create
**Templates (`templates/customers/`)**
- `login.liquid` — login + **forgot-password request** (recover form) on the same page (Shopify convention).
- `register.liquid` — create account.
- `reset_password.liquid` — set new password (reached via email token; completes the forgot flow).
- `account.liquid` — initial dashboard; thin wrapper → `{% section 'customer-account-dashboard' %}`.

**Sections (`sections/`)**
- `customer-login.liquid` — login + recover markup + schema (headings/copy/links editable).
- `customer-register.liquid` — register markup + schema.
- `customer-account-dashboard.liquid` — dashboard shell (blocks for module order/visibility).

**Snippets (`snippets/`)**
- `customer-membership-state.liquid` — shared tier + credits logic (extract the duplicated `inveterate-tier#…` mapping from `membership-widget.liquid`/`membership-modal.liquid`). Assigns `membership_level`, `is_elite`, `credits_earned`, `credits_earned_formatted`.
- `customer-account-nav.liquid` — Dashboard / Orders / Subscription / Credits / Addresses / Logout (`routes.account_logout_url`).
- `customer-auth-card.liquid` (optional) — shared centered auth card wrapper.

**JS (`frontend/scripts/components/`)** + register in `frontend/entrypoints/main.js`
- `authForms.ts` — toggle login ↔ recover-password (`x-data`), submit UX.
- `accountTabs.ts` — mobile nav tabs/switching for the dashboard.

**Locales** — add to `locales/en.default.json`: `customer.login.*`, `customer.register.*`, `customer.recover.*`, `customer.reset.*`, `customer.account.*`, `customer.nav.*`, form error/success strings.

## Screen specs

### Login — `login.liquid` / `customer-login` (Figma `14:9`, mobile `14:242`)
Per frame: **LOGIN** heading · Email + Password inputs · gold **LOGIN** submit · under it two links: **Create Account** (left) + **Forgot Password** (right) · **OR** divider · dark **MANAGE AUTOSHIP** button.
- `{% form 'customer_login' %}`: email, password, gold submit (`wb-button` primary).
- **Create Account** → `/account/register`. **Forgot Password** → recover view (`#recover` hash / Alpine toggle) rendering `{% form 'recover_customer_password' %}`; on `form.posted_successfully?` show the confirmation state.
- **MANAGE AUTOSHIP** (dark `wb-button`) → Stay AI customer portal (autoship management for non-logged-in). Confirm target URL.
- Errors via `form.errors` / `form.errors.translated_fields` (see `Login_ErrorState` `14:57` / mobile `14:279`).
- **Layout:** centered column, `max-w-[…]`, full-width on mobile; light-cream page bg per frame.

### Register — `register.liquid` / `customer-register`
- `{% form 'create_customer' %}`: first name, last name, email, password (+ confirm if design shows it), submit; link to Login.
- Errors handling; success → Shopify redirects to account.

### Reset password — `reset_password.liquid`
- `{% form 'reset_customer_password' %}`: password + confirmation. Reached only via the email token link → test with a real reset email.

### Initial Dashboard — `account.liquid` / `customer-account-dashboard`
Scaffold (skeleton, not full state polish — that's Task 02):
- **Greeting:** `Hi {{ customer.first_name }}` + membership badge (`customer-membership-state`).
- **Account nav** (`customer-account-nav`): desktop sidebar/tabs · mobile tab-bar/accordion (`accountTabs.ts`, `x-cloak`).
- **Placeholder cards** (with `data-*` hooks + mock JSON, real wiring in later tasks):
  - Membership card — tier (native) + "Progress to next tier" placeholder (mock `GET /apps/wb/membership`).
  - "Your next autoship order" — placeholder (mock `GET /apps/wb/subscriptions`).
  - Credits badge — balance (native `credits_earned`) + link (history mock).
  - Order history preview — placeholder/"View all" (real in Task 03).
- **Layout:** desktop `md:` two columns (nav + content grid `md:!grid-cols-2`); tablet `smd:` single column, nav on top; mobile stack, full-width cards.

## Data
- **Native:** `customer`, `customer.first_name`, `customer.tags`, `customer.metafields.inveterate.credits_earned`, `routes.account_*`.
- **Mocked (no worker in this task):** membership progress, subscriptions, credit history — render from an inline mock object matching the contracts in `../account-portal-plan.md` §3 / Data contract; leave clear `TODO(worker)` markers.

## Dependencies / setup
- Dev store must be on **Legacy customer accounts** (Admin → Settings → Customer accounts) or `routes.account_url` goes to new accounts.
- Run via `shopify theme dev` (dev theme). **Do not push to live.**

## Out of scope (later tasks)
- Full Free/VIP/Elite state logic + progress bar wiring (Task 02).
- Order history/detail (03), real subscriptions (04), credit history (05), addresses (06), worker (07).
- `activate_account.liquid` (add with 06 or when invites are needed).

## Acceptance criteria
- [ ] Login works (valid → account; invalid → localized error).
- [ ] Forgot-password request sends the recover email; success state shown.
- [ ] Reset password (via email token) sets a new password.
- [ ] Register creates an account (errors localized).
- [ ] Dashboard renders for a logged-in member: greeting, tier badge, nav, placeholder cards, credits balance.
- [ ] Responsive at 375 / 750 / 1024: auth card centered/full-width; dashboard nav switches sidebar↔tab-bar; no FOUC (`x-cloak`).
- [ ] All copy via locales; no hardcoded strings.
- [ ] `shopify theme check` clean; basic a11y (labels, focus, keyboard).

## Figma parity (frames — `docs/figma/ancillary/`)
Match desktop **and** mobile + every state (see 00-context Design-QA procedure):
- **Login** `14:9` · **Login_ErrorState** `14:57` · **New Account** `14:106` · **Reset Password** `14:156` · **Reset Password_ConfirmationState** `14:198`.
- Mobile: **Login** `14:242` · **Login_ErrorState** `14:279` · **New Account** `14:317` · **Reset Password** `14:353` · **Reset Password_ConfirmationState** `14:384`.
- Note: forgot-password request state — check whether it's a distinct frame or the reset/confirmation flow; mirror Figma exactly.
- Dashboard scaffold layout → cross-check against Account Portal frames (Task 02).
- Pull exact tokens (colors, type, spacing, radii) from `docs/figma/ancillary/file.json` — don't eyeball.

## Verification
`shopify theme dev` → visit `/account/login`, `/account/register`, trigger recover + reset via a real email, log in, view `/account`. Test with accounts tagged FREE/VIP/ELITE to confirm the badge. Check 375/750/1024. **Then run the Figma parity check above.**
