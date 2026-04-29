import { Alpine as AlpineType } from "alpinejs"
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import { CartAddEvent, CartErrorEvent } from '/assets/events'


export default (Alpine: AlpineType) => {
    Alpine.data("productFormBundle", () => ({
        selectedProduct: null,
        bundleProducts: {},
        selectedBundleProducts: {},
        assignedBundleProducts: [],
        loading: false,

        get bundleSize() {
            return Object.values(this.selectedBundleProducts).reduce((acc, product) => {
              return acc + Number(product.quantity || 0)
            }, 0)
          },

        // Helpers
        isInBundle(productId) {
            return this.selectedBundleProducts[productId] !== undefined && this.selectedBundleProducts[productId].quantity > 0
        },

        getBundleProductQuantity(productId) {
            return this.selectedBundleProducts[productId]?.quantity || 0;
        },

        _assignToBundle() {

            let variantIndex = 0;

            switch (this.bundleSize) {
                case 1:
                    variantIndex = 0;
                    break;
                case 2:
                    variantIndex = 1;
                    break;
                case 3:
                    variantIndex = 2;
                    break;
                default:
                    variantIndex = 2;
                    break;
            }

            this.assignedBundleProducts = Object.keys(this.selectedBundleProducts).map((productId) => {
                const product = this.bundleProducts[productId]
                const selectedProduct = this.selectedBundleProducts[productId]
            
                const variants = Object.values(product.variants)
                const variant = variants[variantIndex]
            
                return {
                  id: Number(variant.id),
                  quantity: selectedProduct.quantity,
                  properties: {
                    _bundle_product_id: productId,
                    _bundle_size: this.bundleSize,
                  },
                }
              })

        },

        init() {
            this.bundleProducts = JSON.parse(this.$refs.bundleProducts.textContent);
        },

        addToBundle(productId) {
            const id = String(productId)
          
            this.selectedBundleProducts = {
              ...this.selectedBundleProducts,
              [id]: {
                id,
                quantity: 1,
              },
            }
        },

        
        selectProduct(productId) {
            this.selectedProduct = this.bundleProducts[productId];
            window.dispatchEvent(new CustomEvent('product-changed', { detail: { product: this.selectedProduct }, bubbles: true, composed: true }));
        },

        async addToCart() {
            this.loading = true;
            this._assignToBundle()
          
            const res = await fetch('/cart/add.js', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({
                items: this.assignedBundleProducts,
              }),
            })
          
            if (!res.ok) {
              const errorText = await res.text()
          
              document.dispatchEvent(
                new CartErrorEvent('bundle-atc', 'ATC failed', errorText)
              )
          
              return
            }
          
            const cart = await fetch('/cart.js').then(r => r.json())
          
            document.dispatchEvent(
              new CartAddEvent(cart, 'bundle-atc', {
                source: 'bundle',
                itemCount: cart.item_count,
                autoOpen: true,
              })
            )

            this.selectedBundleProducts = {};

            this.loading = false;
          }


    }))
}
