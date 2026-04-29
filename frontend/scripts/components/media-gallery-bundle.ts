import { Alpine as AlpineType } from "alpinejs"
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

export default (Alpine: typeof Alpine) => {
    Alpine.data("mediaGalleryBundle", () => ({
        selectedProduct: null,
        swiper: null,

        init() {
          window.addEventListener('product-changed', (event: Event) => {
            this.selectedProduct = (event as CustomEvent).detail.product
            this.renderGallery(this.selectedProduct)
          })

        },

        async renderGallery(product) {
          
            const mediaWrapper = this.$el
            if (!mediaWrapper) {
              console.error('mediaWrapper not found')
              return
            }
                    
            try {
              const res = await fetch(`/products/${product.handle}?view=bundle`)
          
              if (!res.ok) {
                throw new Error(`Failed to fetch gallery: ${res.status}`)
              }
          
              const html = await res.text()
              const doc = new DOMParser().parseFromString(html, 'text/html')
          
              const newMediaInner = doc.querySelector('[data-gallery-wrapper]')
          
              if (!newMediaInner) {
                console.error('newMediaInner not found')
                return
              }

              Alpine.morph(mediaWrapper, newMediaInner, {
                childrenOnly: true,
              })

              this.$nextTick(() => {
                this.initSwiper();
              })
              
            } catch (error) {
              console.error('error', error)
            }
          },

          initSwiper() {
            if (this.swiper) {
              this.swiper.destroy(true, true);
              this.swiper = null;
            }

            this.swiper = new Swiper(this.$refs.swiper, {
              slidesPerView: 1,
              loop: true,
            });
          },
    }))
}
