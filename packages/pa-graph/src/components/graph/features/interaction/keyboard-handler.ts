import { ZoomHandler } from './zoom-handler'

export interface KeyboardHandlerOptions {
  zoomHandler: ZoomHandler
}

export class KeyboardHandler {
  private zoomHandler: ZoomHandler
  private keyDownHandler: ((evt: KeyboardEvent) => void) | null = null

  constructor(options: KeyboardHandlerOptions) {
    this.zoomHandler = options.zoomHandler
  }

  /**
   * Setup keyboard event listeners
   */
  setup(): void {
    this.keyDownHandler = (evt: KeyboardEvent) => this.handleKeyDown(evt)
    document.addEventListener('keydown', this.keyDownHandler)
  }

  /**
   * Handle keyboard shortcuts
   */
  private handleKeyDown(evt: KeyboardEvent): void {
    const isModifier = evt.ctrlKey || evt.metaKey

    if (!isModifier) return

    // Ctrl/Cmd + Plus/Equals for zoom in
    if (evt.key === '+' || evt.key === '=') {
      evt.preventDefault()
      this.zoomHandler.zoomAtCenter(true)
    }
    // Ctrl/Cmd + Minus for zoom out
    else if (evt.key === '-') {
      evt.preventDefault()
      this.zoomHandler.zoomAtCenter(false)
    }
    // Ctrl/Cmd + 0 for reset zoom
    else if (evt.key === '0') {
      evt.preventDefault()
      this.zoomHandler.resetZoom()
    }
  }

  /**
   * Cleanup event listeners
   */
  cleanup(): void {
    if (this.keyDownHandler) {
      document.removeEventListener('keydown', this.keyDownHandler)
      this.keyDownHandler = null
    }
  }
}
