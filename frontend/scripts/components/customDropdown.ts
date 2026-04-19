
export default (Alpine: AlpineType) => {
    Alpine.data("swiperSlider", () => ({
        dropdownOpen: false,
        activeItem: null,

        init() {
          
        },

        toggleDropdown() {
            this.dropdownOpen = !this.dropdownOpen;
        },

    }))
}
