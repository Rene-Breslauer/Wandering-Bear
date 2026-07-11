import { Component } from '@theme/component';
import { fetchConfig } from '@theme/utilities';
import { CartUpdateEvent } from '@theme/events';

/**
 * A custom element that manages the "Add/Modify Flavors" bundle editor.
 *
 * The editable flavor list is produced server-side by `sections/bundle-editor.liquid`
 * via the Section Rendering API (rendered against the flavor collection's URL). This
 * component only handles interaction (increment/decrement), quantity hydration from the
 * live cart, and the cart mutation on "Update bundle". After a successful update it
 * dispatches a `CartUpdateEvent`, which Horizon's `cart-items-component` picks up to
 * re-render the drawer through section rendering.
 *
 * @extends {Component}
 */
class BundleEditorComponent extends Component {
  /**
   * @typedef {Object} BundleRow
   * @property {HTMLElement} el
   * @property {number} productId
   * @property {number} variantId
   * @property {Array<{ id: number, price: string, selling_plan_price: string | null }>} variants
   * @property {number} quantity
   * @property {number} originalQuantity
   * @property {string | null} key
   * @property {string | null} flavorName
   */

  /**
   * @typedef {Object} BundleState
   * @property {string} collectionHandle
   * @property {string} bundleName
   * @property {string} bundleId
   * @property {Array<{ variant_id: number, selling_plan_id: number | null }>} tiers
   * @property {number} tierCount
   * @property {BundleRow[]} rows
   */

  /** @type {BundleState | null} */
  #state = null;

  #onTriggerClick = this.#handleTriggerClick.bind(this);

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.#onTriggerClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.#onTriggerClick);
  }

  /** @returns {HTMLElement | null} */
  get #panel() {
    return this.querySelector('[data-bundle-panel]');
  }

  /**
   * Opens the editor when an `[data-bundle-edit-trigger]` element is clicked anywhere.
   * @param {MouseEvent} event
   */
  #handleTriggerClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    const trigger = target?.closest('[data-bundle-edit-trigger]');
    if (!(trigger instanceof HTMLElement)) return;

    event.preventDefault();
    this.open({
      collectionHandle: trigger.dataset.collectionHandle ?? '',
      bundleName: trigger.dataset.bundleName ?? '',
      bundleId: trigger.dataset.bundleId ?? '',
    });
  }

  /**
   * Fetches the section-rendered editor, hydrates quantities and reveals the panel.
   * @param {{ collectionHandle: string, bundleName: string, bundleId: string }} config
   */
  async open({ collectionHandle, bundleName, bundleId }) {
    const panel = this.#panel;
    if (!collectionHandle || !panel) return;

    const url = new URL(`/collections/${collectionHandle}`, window.location.origin);
    url.searchParams.set('section_id', 'bundle-editor');

    const html = await fetch(url.toString()).then((response) => response.text());
    panel.innerHTML = html;

    const root = panel.querySelector('[data-bundle-editor-root]');
    if (!(root instanceof HTMLElement)) return;

    this.#state = {
      collectionHandle,
      bundleName: bundleName || root.dataset.bundleName || '',
      bundleId,
      tiers: this.#parseJSON(root.dataset.tiers, []),
      tierCount: Number(root.dataset.tierCount || 0),
      rows: Array.from(panel.querySelectorAll('[data-bundle-row]')).map((el) => ({
        el: /** @type {HTMLElement} */ (el),
        productId: Number(/** @type {HTMLElement} */ (el).dataset.productId),
        variantId: Number(/** @type {HTMLElement} */ (el).dataset.variantId),
        variants: this.#parseJSON(/** @type {HTMLElement} */ (el).dataset.variants, []),
        quantity: 0,
        originalQuantity: 0,
        key: null,
        flavorName: null,
      })),
    };

    await this.#hydrateQuantities();
    this.#render();
    this.setAttribute('data-open', '');
  }

  /** Reveals the current bundle's line quantities from the live cart. */
  async #hydrateQuantities() {
    if (!this.#state) return;

    const cart = await fetch('/cart.js', { headers: { Accept: 'application/json' } }).then((r) => r.json());

    const items = (cart.items ?? []).filter(
      (item) =>
        String(item.properties?._bundle_id) === String(this.#state?.bundleId) &&
        String(item.properties?._bundle_parent) !== 'true'
    );

    for (const row of this.#state.rows) {
      const cartItem = items.find((item) => Number(item.product_id) === row.productId);
      row.quantity = cartItem?.quantity ?? 0;
      row.originalQuantity = row.quantity;
      row.key = cartItem?.key ?? null;
      row.flavorName = cartItem?.properties?._flavor ?? null;
    }
  }

  /** @returns {number} */
  get #totalQuantity() {
    return this.#state?.rows.reduce((total, row) => total + Number(row.quantity || 0), 0) ?? 0;
  }

  /**
   * Maps a bundle count to the pricing/variant tier index (0, 1 or 2).
   * @param {number} count
   * @returns {number}
   */
  #tierIndex(count) {
    if (count <= 0) return 0;
    return count < 3 ? count - 1 : 2;
  }

  /** Syncs the DOM (quantities, prices, progress, tier dots, update button) to state. */
  #render() {
    if (!this.#state) return;

    const total = this.#totalQuantity;
    const variantIndex = this.#tierIndex(total);

    for (const row of this.#state.rows) {
      row.el.dataset.quantity = String(row.quantity);

      const qty = row.el.querySelector('[data-bundle-qty]');
      if (qty) qty.textContent = String(row.quantity);

      // Toggle via inline style rather than the `hidden` class: the theme's
      // custom `.wb-flex` rule overrides Tailwind's `.hidden`, so a class swap
      // would leave the stepper visible. Inline styles beat any class.
      const add = row.el.querySelector('[data-bundle-add]');
      const stepper = row.el.querySelector('[data-bundle-stepper]');
      if (add instanceof HTMLElement) add.style.display = row.quantity > 0 ? 'none' : '';
      if (stepper instanceof HTMLElement) stepper.style.display = row.quantity > 0 ? '' : 'none';

      const price = row.el.querySelector('[data-bundle-price]');
      const variant = row.variants[variantIndex];
      if (price && variant) price.textContent = variant.selling_plan_price ?? variant.price;
    }

    const tierCount = this.#state.tierCount || this.#state.tiers.length;
    const progress = tierCount ? Math.min(100, (total / tierCount) * 100) : 0;
    const bar = this.querySelector('[data-bundle-progress]');
    if (bar instanceof HTMLElement) bar.style.width = `${progress}%`;

    for (const dot of this.querySelectorAll('[data-tier-dot]')) {
      const tier = Number(/** @type {HTMLElement} */ (dot).dataset.tierDot);
      const inner = dot.querySelector('[data-tier-dot-inner]');
      const active = total >= tier;

      dot.classList.toggle('!outline-gold', active);
      dot.classList.toggle('!bg-white', active);
      dot.classList.toggle('outline-[#CFBDB1]', !active);
      dot.classList.toggle('bg-[#F2E6DC]', !active);
      inner?.classList.toggle('!bg-gold', active);
    }

    const changed = this.#bundleChanged;
    const button = this.querySelector('[data-bundle-update]');
    if (button instanceof HTMLButtonElement) {
      button.disabled = !changed;
      button.classList.toggle('opacity-50', !changed);
      button.classList.toggle('!pointer-events-none', !changed);
    }
  }

  /** @returns {boolean} */
  get #bundleChanged() {
    return this.#state?.rows.some((row) => row.quantity !== row.originalQuantity) ?? false;
  }

  /**
   * @param {Event} event
   * @returns {BundleRow | undefined}
   */
  #rowFromEvent(event) {
    const target = event.target instanceof Element ? event.target : null;
    const rowEl = target?.closest('[data-bundle-row]');
    return this.#state?.rows.find((row) => row.el === rowEl);
  }

  /**
   * Increments a flavor's quantity. Bound declaratively via `on:click`.
   * @param {Event} event
   */
  increment(event) {
    const row = this.#rowFromEvent(event);
    if (!row) return;
    row.quantity += 1;
    this.#render();
  }

  /**
   * Decrements a flavor's quantity. Bound declaratively via `on:click`.
   * @param {Event} event
   */
  decrement(event) {
    const row = this.#rowFromEvent(event);
    if (!row) return;
    row.quantity = Math.max(0, row.quantity - 1);
    this.#render();
  }

  /** Closes the editor and returns to the cart. Bound declaratively via `on:click`. */
  backToCart() {
    this.removeAttribute('data-open');
  }

  /**
   * Commits the edited bundle to the cart. Bound declaratively via `on:submit`.
   * @param {SubmitEvent} [event]
   */
  async update(event) {
    event?.preventDefault();

    const state = this.#state;
    if (!state || !this.#bundleChanged) return;

    /** @type {Record<string, number>} */
    const updates = {};
    /** @type {Array<Record<string, unknown>>} */
    const additions = [];

    const { bundleId, collectionHandle, bundleName } = state;

    const bundleCount = state.rows.reduce((total, row) => total + Number(row.quantity || 0), 0);
    if (bundleCount <= 0) return;

    const bundleVariantIndex = this.#tierIndex(bundleCount);
    const parentTier = state.tiers[bundleVariantIndex];
    if (!parentTier) return;

    const cart = await fetch('/cart.js', { headers: { Accept: 'application/json' } }).then((r) => r.json());

    const oldParentProduct = (cart.items ?? []).find(
      (item) =>
        String(item.properties?._bundle_id) === String(bundleId) &&
        String(item.properties?._bundle_parent) === 'true'
    );

    const newParentVariantId = Number(parentTier.variant_id);
    const oldParentVariantId = oldParentProduct ? Number(oldParentProduct.variant_id || oldParentProduct.id) : null;
    const parentChanged = oldParentVariantId !== newParentVariantId;
    const sellingPlanId = parentTier.selling_plan_id || null;

    /**
     * @param {BundleRow} row
     * @param {number} variantId
     */
    const addChild = (row, variantId) => {
      if (!row.quantity || !variantId) return;
      additions.push({
        id: Number(variantId),
        quantity: Number(row.quantity),
        selling_plan: sellingPlanId,
        properties: {
          _bundle_id: bundleId,
          _bundle_name: bundleName,
          _collection_handle: collectionHandle,
          _flavor_name: row.flavorName,
        },
      });
    };

    const addParent = () => {
      additions.push({
        id: newParentVariantId,
        quantity: 1,
        selling_plan: sellingPlanId,
        properties: {
          _bundle_id: bundleId,
          _bundle_parent: 'true',
          _bundle_name: bundleName,
          _collection_handle: collectionHandle,
        },
      });
    };

    for (const row of state.rows) {
      const newChildVariantId = row.variants?.[bundleVariantIndex]?.id || row.variantId;

      if (row.key) {
        if (parentChanged) {
          updates[row.key] = 0;
          addChild(row, newChildVariantId);
        } else {
          updates[row.key] = Number(row.quantity);
        }
        continue;
      }

      addChild(row, newChildVariantId);
    }

    if (oldParentProduct && parentChanged) updates[oldParentProduct.key] = 0;
    if (!oldParentProduct || parentChanged) addParent();

    if (Object.keys(updates).length) {
      const response = await fetch('/cart/update.js', fetchConfig('json', { body: JSON.stringify({ updates }) }));
      if (!response.ok) {
        console.error(await response.text());
        return;
      }
    }

    if (additions.length) {
      const response = await fetch('/cart/add.js', fetchConfig('json', { body: JSON.stringify({ items: additions }) }));
      if (!response.ok) {
        console.error(await response.text());
        return;
      }
    }

    const updatedCart = await fetch('/cart.js', { headers: { Accept: 'application/json' } }).then((r) => r.json());

    document.dispatchEvent(
      new CartUpdateEvent(updatedCart, 'bundle-editor', {
        itemCount: updatedCart.item_count,
        source: 'bundle-editor',
      })
    );

    this.backToCart();
  }

  /**
   * @param {string | undefined} value
   * @param {any} fallback
   * @returns {any}
   */
  #parseJSON(value, fallback) {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
}

if (!customElements.get('bundle-editor-component')) {
  customElements.define('bundle-editor-component', BundleEditorComponent);
}
