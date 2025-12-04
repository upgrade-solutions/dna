import { dia } from '@joint/plus'

export interface ZoomHandlerOptions {
  paper: dia.Paper
  container: HTMLElement
  minScale?: number
  maxScale?: number
  zoomFactor?: number
  onScaleChange?: (scale: number) => void
}

export class ZoomHandler {
  private paper: dia.Paper
  private container: HTMLElement
  private minScale: number
  private maxScale: number
  private zoomFactor: number
  private onScaleChange?: (scale: number) => void

  constructor(options: ZoomHandlerOptions) {
    this.paper = options.paper
    this.container = options.container
    this.minScale = options.minScale ?? 0.2
    this.maxScale = options.maxScale ?? 3
    this.zoomFactor = options.zoomFactor ?? 1.1
    this.onScaleChange = options.onScaleChange
  }

  /**
   * Zoom centered on a specific point (typically cursor position)
   */
  zoomAtPoint(clientX: number, clientY: number, zoomIn: boolean): void {
    const oldScale = this.paper.scale()
    const delta = zoomIn ? this.zoomFactor : 1 / this.zoomFactor
    const newScale = oldScale.sx * delta

    // Limit scale
    if (newScale < this.minScale || newScale > this.maxScale) {
      return
    }

    // Get cursor position relative to the paper
    const rect = this.container.getBoundingClientRect()
    const cursorX = clientX - rect.left
    const cursorY = clientY - rect.top

    // Get current transform
    const currentTranslate = this.paper.translate()

    // Calculate point in paper coordinates before scaling
    const pointBeforeZoom = {
      x: (cursorX - currentTranslate.tx) / oldScale.sx,
      y: (cursorY - currentTranslate.ty) / oldScale.sy
    }

    // Apply new scale
    this.paper.scale(newScale, newScale)

    // Calculate new translation to keep cursor point fixed
    const newTx = cursorX - pointBeforeZoom.x * newScale
    const newTy = cursorY - pointBeforeZoom.y * newScale

    this.paper.translate(newTx, newTy)

    // Notify callback
    this.onScaleChange?.(newScale)
  }

  /**
   * Zoom centered on canvas center
   */
  zoomAtCenter(zoomIn: boolean): void {
    const oldScale = this.paper.scale()
    const delta = zoomIn ? 1.2 : 1 / 1.2
    const newScale = oldScale.sx * delta

    // Limit scale
    if (newScale < this.minScale || newScale > this.maxScale) {
      return
    }

    this.paper.scale(newScale, newScale)
    this.onScaleChange?.(newScale)
  }

  /**
   * Reset zoom to 100%
   */
  resetZoom(): void {
    this.paper.scale(1, 1)
    this.onScaleChange?.(1)
  }

  /**
   * Get current scale
   */
  getScale(): number {
    return this.paper.scale().sx
  }

  /**
   * Zoom and pan to focus on a specific element with smooth animation
   */
  zoomToNode(element: dia.Element, padding: number = 50, duration: number = 300): void {
    const bbox = element.getBBox()
    const containerRect = this.container.getBoundingClientRect()
    
    // Calculate scale to fit the node with padding
    const scaleX = containerRect.width / (bbox.width + padding * 2)
    const scaleY = containerRect.height / (bbox.height + padding * 2)
    const targetScale = Math.min(scaleX, scaleY, this.maxScale)
    
    // Clamp to min/max scale
    const newScale = Math.max(this.minScale, Math.min(this.maxScale, targetScale))
    
    // Calculate center position of the node
    const nodeCenterX = bbox.x + bbox.width / 2
    const nodeCenterY = bbox.y + bbox.height / 2
    
    // Calculate translation to center the node in the viewport
    const newTx = containerRect.width / 2 - nodeCenterX * newScale
    const newTy = containerRect.height / 2 - nodeCenterY * newScale
    
    // Get current state
    const currentScale = this.paper.scale().sx
    const currentTranslate = this.paper.translate()
    
    // Animate the transition
    const startTime = performance.now()
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-in-out)
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2
      
      // Interpolate scale
      const interpolatedScale = currentScale + (newScale - currentScale) * eased
      this.paper.scale(interpolatedScale, interpolatedScale)
      
      // Interpolate translation
      const interpolatedTx = currentTranslate.tx + (newTx - currentTranslate.tx) * eased
      const interpolatedTy = currentTranslate.ty + (newTy - currentTranslate.ty) * eased
      this.paper.translate(interpolatedTx, interpolatedTy)
      
      // Notify callback
      this.onScaleChange?.(interpolatedScale)
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }
}
