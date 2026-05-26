import { Alpine as AlpineType } from 'alpinejs'

type Line = {
  id: number
  x1: number
  y1: number
  x2: number
  y2: number
}

export default (Alpine: AlpineType) => {
  Alpine.data('diagramToggle', (initialState: number = 0) => ({
    lines: [] as Line[],

    state: initialState,
    pendingState: null as number | null,

    el: null as HTMLElement | null,

    indicatorStyle: '',
    isDragging: false,
    isSwapping: false,

    resizeHandler: null as (() => void) | null,

    init() {
      this.el = this.$el as HTMLElement

      this.mountState(this.state, false)
      this.updateIndicator(this.state)

      this.resizeHandler = () => {
        requestAnimationFrame(() => {
          this.updateIndicator(this.state)

          this.$nextTick(() => {
            this.draw()
          })
        })
      }

      window.addEventListener('resize', this.resizeHandler)
    },

    destroy() {
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler)
      }
    },

    async setState(index: number) {
      if (index === this.state || this.isSwapping) return

      await this.mountState(index, true)
    },

    async mountState(index: number, animate = true) {
      const template = this.el?.querySelector<HTMLTemplateElement>(
        `template[data-template-view="${index}"]`
      )

      const content = this.$refs.content as HTMLElement | undefined

      if (!template || !content) return

      this.isSwapping = true

      const previousChildren = Array.from(content.children)

      const next = document.createElement('div')
      next.appendChild(template.content.cloneNode(true))

      if (animate && previousChildren.length) {
        content.style.minHeight = `${content.offsetHeight}px`

        next.className =
          'absolute inset-0 w-full opacity-0 transition-opacity duration-200'

        content.appendChild(next)
        Alpine.initTree(next)
       

        await this.$nextTick()
        await this.waitForImages(next)

        this.$nextTick(() => {
          this.draw(next)
        })

        requestAnimationFrame(() => {
          next.classList.remove('opacity-0')
          next.classList.add('opacity-100')
        })

        window.setTimeout(() => {
          previousChildren.forEach((child) => child.remove())

          next.classList.remove(
            'absolute',
            'inset-0',
            'w-full',
            'opacity-100',
            'transition-opacity',
            'duration-200'
          )

          content.style.minHeight = ''

          this.state = index
          this.pendingState = null
          this.updateIndicator(index)

          this.isSwapping = false
        }, 220)

        return
      }

      content.replaceChildren(next)
      Alpine.initTree(next)
     

      this.state = index
      this.pendingState = null
      this.updateIndicator(index)

      await this.$nextTick()
      await this.waitForImages(content)

      this.$nextTick(() => {
        this.draw(next)
      })

      this.isSwapping = false
    },

    updateIndicator(index = this.state) {
      const toggle = this.$refs.toggle as HTMLElement | undefined
      if (!toggle) return

      const buttons = toggle.querySelectorAll<HTMLElement>('[data-toggle-button]')
      const activeButton = buttons[index]

      if (!activeButton) return

      this.indicatorStyle = `
        width: ${activeButton.offsetWidth}px;
        transform: translateX(${activeButton.offsetLeft - 8}px);
      `
    },

    startDrag(event: PointerEvent) {
      if (this.isSwapping) return

      this.isDragging = true
      this.pendingState = this.state

      const toggle = this.$refs.toggle as HTMLElement | undefined
      toggle?.setPointerCapture?.(event.pointerId)
    },

    onDrag(event: PointerEvent) {
      if (!this.isDragging || this.isSwapping) return

      const closestIndex = this.getClosestIndex(event.clientX)

      this.pendingState = closestIndex
      this.updateIndicator(closestIndex)
    },

    endDrag() {
      if (!this.isDragging) return

      this.isDragging = false

      if (
        typeof this.pendingState === 'number' &&
        this.pendingState !== this.state
      ) {
        this.setState(this.pendingState)
      } else {
        this.updateIndicator(this.state)
      }

      this.pendingState = null
    },

    getClosestIndex(clientX: number) {
      const toggle = this.$refs.toggle as HTMLElement | undefined
      if (!toggle) return this.state

      const buttons = Array.from(
        toggle.querySelectorAll<HTMLElement>('[data-toggle-button]')
      )

      const rect = toggle.getBoundingClientRect()
      const x = clientX - rect.left

      let closestIndex = this.state
      let closestDistance = Infinity

      buttons.forEach((button, index) => {
        const center = button.offsetLeft + button.offsetWidth / 2
        const distance = Math.abs(x - center)

        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      return closestIndex
    },

    waitForImages(container: HTMLElement) {
      const images = Array.from(container.querySelectorAll('img'))

      return Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve()

          return new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true })
            img.addEventListener('error', () => resolve(), { once: true })
          })
        })
      )
    },

    draw(container?: HTMLElement) {
      const activeContent =
        container ||
        ((this.$refs.content as HTMLElement | undefined)?.firstElementChild as HTMLElement | null)
    
      if (!activeContent) return
    
      const lineWrapper = activeContent.querySelector<HTMLElement>('[data-line-wrapper]')
      if (!lineWrapper) return
    
      const wrapperRect = lineWrapper.getBoundingClientRect()
    
      const image = lineWrapper.querySelector<HTMLElement>('[data-diagram-image]')
      if (!image) return
    
      const imageRect = image.getBoundingClientRect()

      const anchors = [
        { x: 0.72, y: 0.25 },
        { x: 0.28, y: 0.45 },
        { x: 0.72, y: 0.62 },
      ]
    
      this.lines = Array.from(
        lineWrapper.querySelectorAll<HTMLElement>('[data-callout]')
      )
        .map((el) => {
          const index = Number(el.dataset.index)
          const anchor = anchors[index]
          const icon = el.querySelector('img')

          if (!icon || !anchor) return null
    
          const iconRect = icon.getBoundingClientRect()
          const isLeft = iconRect.left < imageRect.left
    
          return {
            id: index,
            x1: imageRect.left + imageRect.width * anchor.x - wrapperRect.left,
            y1: imageRect.top + imageRect.height * anchor.y - wrapperRect.top,
            x2: isLeft
              ? iconRect.right - wrapperRect.left
              : iconRect.left - wrapperRect.left,
            y2: iconRect.top + iconRect.height / 2 - wrapperRect.top,
          }
        })
        .filter(Boolean) as Line[]

        this.renderLines()
    },

    renderLines() {
      const svg = this.$refs.linesSvg as SVGSVGElement | undefined
      if (!svg) return
    
      svg.innerHTML = ''
    
      this.lines.forEach((line) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    
        el.setAttribute('x1', String(line.x1))
        el.setAttribute('y1', String(line.y1))
        el.setAttribute('x2', String(line.x2))
        el.setAttribute('y2', String(line.y2))
        el.setAttribute('stroke', '#2f1a0f')
        el.setAttribute('stroke-width', '1')
        el.setAttribute('stroke-dasharray', '4 4')
    
        svg.appendChild(el)
      })
    }

  }))
}