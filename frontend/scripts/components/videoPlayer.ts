import { Alpine as AlpineType } from "alpinejs"
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

export default (Alpine: AlpineType) => {
    Alpine.data("VideoPlayer", (
        video: any) => ({
        video: video,
        el: null,

        init() {
            this.el = this.$el;
            console.log(this.el);
            this.video = this.el.querySelector('video');
            console.log(this.video);
        },

        toggleSound() {
            this.video.muted = !this.video.muted;
        },

        togglePlay() {
            if (this.video.paused) {
                this.video.play();
            } else {
                this.video.pause();
            }
        },

    }))
}
