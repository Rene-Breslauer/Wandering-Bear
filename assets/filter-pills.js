import { sectionRenderer } from '@theme/section-renderer';
import { Component } from '@theme/component';
import { startViewTransition } from '@theme/utilities';

/**
 * Single-select filter pills.
 *
 * The pills are real links to filtered collection URLs, so the block works with no
 * JS at all and keeps deep-linking, bookmarking and cmd-click intact. This component
 * only upgrades a plain left click into a Section Rendering API swap of the
 * collection section — the same mechanism `facets.js` uses to re-render the grid.
 *
 * The pills live inside the section they re-render, so the morph brings back the
 * server's own active pill; there is no client-side selection state to keep in sync.
 *
 * @extends {Component}
 */
class FilterPills extends Component {
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', this.#handlePopState);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.#handlePopState);
  }

  get sectionId() {
    const id = this.getAttribute('section-id');
    if (!id) throw new Error('Section ID is required');
    return id;
  }

  /**
   * Applies a pill's filter without a full page load.
   * Bound declaratively via `on:click` on each pill.
   *
   * @param {MouseEvent} event
   */
  navigate(event) {
    const link = event.target;

    if (!(link instanceof HTMLAnchorElement)) return;

    // Leave anything that isn't a plain left click to the browser: new tab, new
    // window and "open in background" must keep working.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    const url = new URL(link.href, window.location.href);

    // Re-clicking the active pill is a no-op: these are single-select, so there is
    // nothing to toggle off. "Shop all" is how you clear.
    if (url.href === new URL(window.location.href).href) return;

    history.pushState({ filterPills: true }, '', url.href);
    this.#render(url);
  }

  /**
   * Re-renders for whatever URL the history entry points at, so Back and Forward
   * land on the right filter instead of a stale grid.
   */
  #handlePopState = () => {
    this.#render(new URL(window.location.href));
  };

  /**
   * @param {URL} url
   */
  async #render(url) {
    this.setAttribute('aria-busy', 'true');

    try {
      await startViewTransition(
        () => sectionRenderer.renderSection(this.sectionId, { url }),
        ['product-grid']
      );

      this.#announce();
    } finally {
      this.removeAttribute('aria-busy');
    }
  }

  /**
   * Tells screen readers the grid changed. A visual user sees the swap; without
   * this the filtering is silent, since no page load is announced.
   */
  #announce() {
    // Query the live document rather than `this` or a ref: if the morph ever swaps
    // this element out, both would point at a detached node and the announcement
    // would silently go nowhere.
    const root =
      document.querySelector(`filter-pills-component[section-id="${this.sectionId}"]`) ?? this;

    const status = document.querySelector(`[data-filter-pills-status="${this.sectionId}"]`);
    const active = root.querySelector('[aria-current="true"]');

    if (!(status instanceof HTMLElement) || !(active instanceof HTMLElement)) return;

    status.textContent = active.dataset.announce ?? '';
  }
}

if (!customElements.get('filter-pills-component')) {
  customElements.define('filter-pills-component', FilterPills);
}
