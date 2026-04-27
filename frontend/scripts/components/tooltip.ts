import { Alpine as AlpineType } from "alpinejs"
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

export default (Alpine: AlpineType) => {
    Alpine.data("tooltip", () => ({
        open: false,
        hovering: false,
        left: 0,
        top: 0,
        arrowLeft: 0,
    
        get visible() {
          return this.open || this.hovering
        },
    
        setPosition() {
          const trigger = this.$refs.trigger
          const tooltip = this.$refs.tooltip
          if (!trigger || !tooltip) return
    
          const triggerRect = trigger.getBoundingClientRect()
    
          this.$nextTick(() => {
            const tooltipRect = tooltip.getBoundingClientRect()
            console.log('tooltipRect', tooltipRect)
            const tooltipWidth = tooltipRect.width
            const viewportWidth = window.innerWidth
            const padding = 8
    
            let left = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2)
            
            console.log('left', left)
    
            if (left < padding) left = padding
            if (left + tooltipWidth > viewportWidth - padding) {
              left = viewportWidth - tooltipWidth - padding
            }
    
            this.left = left
            this.top = triggerRect.bottom + 8

            console.log('this.left', this.left)
    
            const triggerCenter = triggerRect.left + (triggerRect.width / 2)
            const minArrow = 16
            const maxArrow = tooltipWidth - 16
    
            let arrowLeft = triggerCenter - left
            if (arrowLeft < minArrow) arrowLeft = minArrow
            if (arrowLeft > maxArrow) arrowLeft = maxArrow
    
            this.arrowLeft = arrowLeft
          })
        },
    
        showTooltip() {
          this.hovering = true
          this.setPosition()
        },
    
        hideTooltip() {
          this.hovering = false
        },
    
        toggleTooltip() {
          this.open = !this.open
          if (this.open) this.setPosition()
        }

    }))
}
