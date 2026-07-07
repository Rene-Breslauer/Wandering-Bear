# Task 06 — Addresses (+ activate account)

**Read first:** `00-context.md`. **Part A.** Depends on **01**. Fully **native**.

## Goal
Address book (add / edit / delete, default address) and the account activation page — styled to the guide, standard Shopify forms.

## Files
- `templates/customers/addresses.liquid` → `{% section 'customer-addresses' %}`.
- `sections/customer-addresses.liquid` — list + add/edit forms.
- `templates/customers/activate_account.liquid` — activation (email-token flow).

## Spec
- **List:** `{% paginate customer.addresses by 10 %}`; show default badge (`customer.default_address`).
- **Add:** `{% form 'customer_address', customer.new_address %}`. **Edit:** `{% form 'customer_address', address %}`. Both expose `set_as_default_checkbox`. Delete via the address delete link/button.
- **Fields:** first/last name, company, address1/2, city, country + province (Shopify country/province selectors), zip, phone.
- **Errors** via `form.errors`.
- **Activate account:** `{% form 'activate_customer_password' %}` (password + confirm); reached only via invite email token → test with a real invite.
- **Responsive:** list cards; add/edit in a modal or inline panel (`x-data`); full-width mobile.

## Data
100% native Liquid.

## Acceptance criteria
- [ ] Add / edit / delete address works; set-as-default works.
- [ ] Country/province selectors populate correctly.
- [ ] Activation sets a password (via real invite token).
- [ ] Errors localized; responsive 375/750/1024; a11y.
- [ ] Copy via locales; Theme Check clean.

## Figma parity — ⚠️ no dedicated frame in Figma
- The Account Portal / Ancillary files have **no addresses or activate-account frame**. Build to the **WB Style Guide**, consistent with the auth cards (Ancillary) + dashboard styling (inputs, buttons, cards, type). **Flag to AW** if dedicated frames are expected.
- Follow 00-context Design-QA procedure against the style guide + neighbouring screens.

## Verification
`shopify theme dev`; `/account/addresses` CRUD; trigger a customer invite to test activation. **Then run the Figma parity check above (against WB guide + auth/dashboard styling).**
