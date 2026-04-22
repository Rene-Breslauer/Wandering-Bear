import { Alpine as AlpineType } from "alpinejs"
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

export default (Alpine: AlpineType) => {
    Alpine.data("header", () => ({
        drawerOpen: false,

        init() {
            
        },

        openDrawer() {
            this.drawerOpen = true;
            document.getElementById('Details-menu-drawer-container')?.classList.add('menu-open');
            document.getElementById('Details-menu-drawer-container')?.setAttribute('open', 'true');
            window.dispatchEvent(new CustomEvent('menu-drawer-open'));
        },

        closeDrawer() {
            this.drawerOpen = false;
            document.getElementById('Details-menu-drawer-container')?.classList.remove('menu-open');
            document.getElementById('Details-menu-drawer-container')?.setAttribute('open', 'false');
            window.dispatchEvent(new CustomEvent('menu-drawer-close'));
        },

        toggleDrawer() {
            console.log('toggleDrawer');
            this.drawerOpen = !this.drawerOpen;

            document.getElementById('Details-menu-drawer-container')?.classList.toggle('menu-open');
            document.getElementById('Details-menu-drawer-container')?.setAttribute('open', this.drawerOpen ? 'true' : 'false');

            if (this.drawerOpen) {
                window.dispatchEvent(new CustomEvent('menu-drawer-open'));
            } else {
                window.dispatchEvent(new CustomEvent('menu-drawer-close'));
            }
        },

    }))
}
