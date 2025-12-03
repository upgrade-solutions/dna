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
}
