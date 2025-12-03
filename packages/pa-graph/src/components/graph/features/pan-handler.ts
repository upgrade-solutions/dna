import { dia } from '@joint/plus'

export interface PanHandlerOptions {
  paper: dia.Paper
}

export class PanHandler {
  private paper: dia.Paper
  private isPanning = false
  private lastPosition = { x: 0, y: 0 }
  private mouseMoveHandler: ((evt: MouseEvent) => void) | null = null
  private mouseUpHandler: (() => void) | null = null

  constructor(options: PanHandlerOptions) {
    this.paper = options.paper
  }

  /**
   * Pan by delta amounts
   */
  pan(deltaX: number, deltaY: number): void {
    const currentTranslate = this.paper.translate()
    this.paper.translate(
      currentTranslate.tx + deltaX,
      currentTranslate.ty + deltaY
    )
  }

  /**
   * Start panning (typically on blank area mousedown)
   */
  startPan(clientX: number, clientY: number): void {
    this.isPanning = true
    this.lastPosition = { x: clientX, y: clientY }
    this.paper.el.style.cursor = 'grabbing'

    // Setup document-level handlers for drag
    this.mouseMoveHandler = (evt: MouseEvent) => this.handleMouseMove(evt)
    this.mouseUpHandler = () => this.endPan()

    document.addEventListener('mousemove', this.mouseMoveHandler)
    document.addEventListener('mouseup', this.mouseUpHandler)
  }

  /**
   * End panning
   */
  endPan(): void {
    if (!this.isPanning) return

    this.isPanning = false
    this.paper.el.style.cursor = 'default'

    // Cleanup document-level handlers
    if (this.mouseMoveHandler) {
      document.removeEventListener('mousemove', this.mouseMoveHandler)
      this.mouseMoveHandler = null
    }
    if (this.mouseUpHandler) {
      document.removeEventListener('mouseup', this.mouseUpHandler)
      this.mouseUpHandler = null
    }
  }

  /**
   * Handle mouse move during pan
   */
  private handleMouseMove(evt: MouseEvent): void {
    if (!this.isPanning) return

    const dx = evt.clientX - this.lastPosition.x
    const dy = evt.clientY - this.lastPosition.y

    this.pan(dx, dy)

    this.lastPosition = { x: evt.clientX, y: evt.clientY }
  }

  /**
   * Cleanup handlers
   */
  cleanup(): void {
    this.endPan()
  }
}
