import { Alpine as AlpineType } from "alpinejs"
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

export default (Alpine: AlpineType) => {
    Alpine.data("swiperSlider", (
        activeCollectionTitle: string, 
        activeCollectionAccentText: string, 
        activeCollectionHandle: string) => ({
        swiper: null,
        dropdownOpen: false,
        el: null,
        activeCollectionTitle: activeCollectionTitle,
        activeCollectionAccentText: activeCollectionAccentText,
        activeCollectionHandle: activeCollectionHandle,

        init() {
            this.el = this.$el;
            this.initSwiper();
        },

        initSwiper() {
            this.swiper = new Swiper(this.el.querySelector('.swiper'), {
                modules: [Navigation],
                slidesPerView: 2.5,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                breakpoints: {
                    768: {
                        slidesPerView: 3.5,
                    },
                    1024: {
                        slidesPerView: 5.5,
                    },
                },
            });
        },

        toggleDropdown() {
            this.dropdownOpen = !this.dropdownOpen;
        },

        changeCollection(title: string, accentText: string, collectionHandle: string) {
            this.dropdownOpen = false;

            const url = `/collections/${collectionHandle}?view=collection-carousel`;

            fetch(url)
                .then(response => response.text())
                .then(html => {
                    const swiperWrapper = this.el.querySelector('.swiper-wrapper');
                    swiperWrapper.innerHTML = html;
                    this.swiperDestroy();
                    this.initSwiper();

                    this.activeCollectionTitle = title;
                    this.activeCollectionAccentText = accentText;
                    this.activeCollectionHandle = collectionHandle;
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
