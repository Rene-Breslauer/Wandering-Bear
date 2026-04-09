import { Alpine as AlpineType } from "alpinejs"
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

export default (Alpine: AlpineType) => {
    Alpine.data("swiperSlider", () => ({
        swiper: null,
        dropdownOpen: false,
        el: null,

        init() {
            this.el = this.$el;
            this.initSwiper();
        },

        initSwiper() {
            this.swiper = new Swiper(this.el.querySelector('.swiper'), {
                modules: [Navigation],
                slidesPerView: 5.5,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
            });

            console.log('this.swiper', this.swiper);
        },

        changeCollection(collectionHandle) {
            this.dropdownOpen = false;

            const url = `/collections/${collectionHandle}?view=collection-carousel`;
            
            // Fetch using view collections/${collectionHandle}?view=collection-carousel
            fetch(url)
                .then(response => response.text())
                .then(html => {
                    const swiperWrapper = this.el.querySelector('.swiper-wrapper');
                    swiperWrapper.innerHTML = html;
                    this.swiperDestroy();
                    this.initSwiper();
                })
                .catch(error => {
                    console.error('Error fetching collection carousel:', error);
            });

        },

        swiperDestroy() {
            this.swiper.destroy();
            this.swiper = null;
        },

    }))
}
