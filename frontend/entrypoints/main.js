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
import '../styles/divider.css';
import '../styles/footer.css';
import '../styles/header.css';

export {}

let loaded = false

const init = async () => {
    if (loaded) return
    loaded = true
    const { default: Alpine } = await import("alpinejs")

    const { default: SwiperSlider } = await import("~/scripts/components/swiperSlider")
    const { default: VideoPlayer } = await import("~/scripts/components/videoPlayer")
    const { default: Header } = await import("~/scripts/components/header")
    const { default: Tooltip } = await import("~/scripts/components/tooltip")
    
    Alpine.plugin(SwiperSlider)
    Alpine.plugin(VideoPlayer)
    Alpine.plugin(Header)
    Alpine.plugin(Tooltip)
    
    Alpine.start()
    window.Alpine = Alpine
}

document.addEventListener("mousedown", init, { once: true })
document.addEventListener("mousemove", init, { once: true })
document.addEventListener("scroll", init, { once: true })
document.addEventListener("touchstart", init, { once: true })
document.addEventListener("keydown", init, { once: true })

