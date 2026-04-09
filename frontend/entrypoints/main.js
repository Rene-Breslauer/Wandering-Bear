import 'vite/modulepreload-polyfill'

import 'swiper/bundle';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import '../styles/typography.css';
import '../styles/colors.css';
import '../styles/components.css';
import '../styles/multi-collection-slider.css';

export {}

let loaded = false

const init = async () => {
    if (loaded) return
    loaded = true
    const { default: Alpine } = await import("alpinejs")

    const { default: SwiperSlider } = await import("~/scripts/components/swiperSlider")

    Alpine.plugin(SwiperSlider)

    Alpine.start()
    window.Alpine = Alpine
}

document.addEventListener("mousedown", init, { once: true })
document.addEventListener("mousemove", init, { once: true })
document.addEventListener("scroll", init, { once: true })
document.addEventListener("touchstart", init, { once: true })
document.addEventListener("keydown", init, { once: true })

