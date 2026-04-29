import { Alpine as AlpineType } from "alpinejs"
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

export default (Alpine: typeof Alpine) => {
    Alpine.data("mediaGalleryBundle", () => ({
        selectedProduct: null,
        swiper: null,
        swiperThumbs: null,

        _initSwiperThumbs() {

          const that = this

          if (this.swiperThumbs) {
            this.swiperThumbs.destroy(true, true);
            this.swiperThumbs = null;
          }

          this.swiperThumbs = new Swiper(this.$refs.swiperThumbs, {
            slidesPerView: 5,
            spaceBetween: 10,
            watchSlidesProgress: true,
          });
        },

        _initSwiper() {
          if (this.swiper) {
            this.swiper.destroy(true, true);
            this.swiper = null;
          }

          this._initSwiperThumbs()

          const that = this

          this.swiper = new Swiper(this.$refs.swiper, {
            slidesPerView: 1,
            thumbs: {
              swiper: that.swiperThumbs,
            },
            
          });
        },

        init() {
          window.addEventListener('product-changed', (event: Event) => {
            this.selectedProduct = (event as CustomEvent).detail.product
            this.renderGallery(this.selectedProduct)
          })

          this._initSwiper()

        },

        async renderGallery(product) {
          
            const mediaWrapper = document.querySelector('[data-media-gallery-bundle-container]')
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
          
              const newMediaInner = doc.querySelector('[data-media-gallery-bundle]')
          
              if (!newMediaInner) {
                console.error('newMediaInner not found')
                return
              }

              // Alpine.morph(mediaWrapper, newMediaInner, {
              //   childrenOnly: true,
              // })

              mediaWrapper.replaceChildren(...Array.from(newMediaInner.childNodes))


              this.$nextTick(() => {
                this._initSwiper();
              })
              
            } catch (error) {
              console.error('error', error)
            }
          },

          
    }))
}
