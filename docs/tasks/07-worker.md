# Task 07 — Worker + Shopify App Proxy (Part B)

**Read first:** `00-context.md` + `../account-portal-plan.md` §3 / "Two-part delivery". **Part B** (backend). ⚠️ Never deployed to live without approval.

## Goal
One backend (Cloudflare Worker) behind one Shopify **App Proxy** (`/apps/wb/*`) that securely serves the theme with **Inveterate** (membership progress, credit history/redemption) and **Stay AI / Retextion** (subscriptions) data, scoped per logged-in member.

## Deliverables
- Worker source + `wrangler.toml` (or existing app).
- Shopify **App Proxy** config (subpath `apps` / prefix `wb` → worker URL) in a Shopify app.
- Env secrets: `SHOPIFY_APP_SECRET`, `INVETERATE_API_KEY`, `STAY_AI_API_KEY` (+ Admin API token if resolving email from customer id).
- Implemented routes + contracts.

## Routes (contracts in `../account-portal-plan.md`)
- `GET /apps/wb/membership` → Inveterate: `{ tier, next_tier, metric, current, threshold, remaining, percent }`.
- `GET /apps/wb/subscriptions` → Stay AI (`api.retextion.com/api/v2/subscriptions?email=…`): `{ member, subscriptions[] }`.
- `GET /apps/wb/credits` → Inveterate credit history: `{ balance, history[] }`.
- Optional `POST` — subscription cancel/edit (Stay AI) and credit redemption (Inveterate), or delegate to Stay AI portal.

## 🔐 Secure exchange (mandatory)
1. **Verify App Proxy HMAC** `signature` (sorted query, signed with `SHOPIFY_APP_SECRET`) → reject on mismatch.
2. **Identity = `logged_in_customer_id`** only (Shopify-injected). Absent → `401`. Never trust client-supplied id/email.
3. **Server-side scoping** — resolve member email (Admin API), query upstreams scoped to that member only.
4. **Secrets in Worker env only** — never in theme/settings/metafields/JS.
5. **Response minimization** — return only contract fields; strip payment tokens/PII.
6. **App-Proxy-only** — no permissive CORS; reject unsigned requests.
7. **Mutations** — verify the resource belongs to the member; guard replay (short-lived nonce/idempotency).
8. **Rate-limit + cache** per member; sanitize upstream errors.

## Acceptance criteria
- [ ] Signature verification rejects forged/direct calls.
- [ ] Each route returns its contract, scoped to the logged-in member.
- [ ] No secret reachable from the browser; unsigned/unauth requests → 401.
- [ ] Caching + rate limiting in place; errors sanitized.
- [ ] Theme Part A (04/05/02) swapped from mocks to live endpoints and works.

## Verification
Local `wrangler dev` + Shopify dev store App Proxy; hit `/apps/wb/*` as a logged-in member; confirm scoping (member A can't see member B), signature rejection, and that data matches Inveterate/Stay AI. **Do not deploy to live** without approval.
