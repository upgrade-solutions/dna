import { dia } from '@joint/plus'
import type { TenantConfig } from '../../../data/tenant-config'
import type { ZoomHandler } from './zoom-handler'

/**
 * Manages event handlers for graph interactions
 */
export class GraphEventHandler {
  private selectedCellView: dia.CellView | null = null
  private paper: dia.Paper
  private tenantConfig: TenantConfig
  private onCellViewSelected?: (cellView: dia.CellView | null) => void
  private zoomHandler?: ZoomHandler

  constructor(
    paper: dia.Paper,
    tenantConfig: TenantConfig,
    onCellViewSelected?: (cellView: dia.CellView | null) => void,
    zoomHandler?: ZoomHandler
  ) {
    this.paper = paper
    this.tenantConfig = tenantConfig
    this.onCellViewSelected = onCellViewSelected
    this.zoomHandler = zoomHandler
  }

  /**
   * Setup all event listeners
   */
  setupEvents(): void {
    this.setupCellClickHandler()
    this.setupCellDoubleClickHandler()
    this.setupBlankClickHandler()
  }

  /**
   * Handle cell (node/link) click events
   */
  private setupCellClickHandler(): void {
    this.paper.on('cell:pointerclick', (cellView: dia.CellView) => {
      // Unhighlight previous selection
      if (this.selectedCellView) {
        this.selectedCellView.unhighlight()
      }
      
      // Highlight and track new selection with 2px theme color border (convention)
      cellView.highlight(null, {
        highlighter: {
          name: 'stroke',
          options: {
            padding: 0,
            rx: 8,
            ry: 8,
            attrs: {
              'stroke-width': 2,
              stroke: this.tenantConfig.styles.nodes[cellView.model.get('type')]?.stroke || '#3b82f6'
            }
          }
        }
      })
      
      this.selectedCellView = cellView
      this.onCellViewSelected?.(cellView)
    })
  }

  /**
   * Handle cell (node/link) double-click events to zoom and focus
   */
  private setupCellDoubleClickHandler(): void {
    this.paper.on('cell:pointerdblclick', (cellView: dia.CellView) => {
      // Only zoom to elements (nodes), not links
      if (cellView.model.isElement() && this.zoomHandler) {
        this.zoomHandler.zoomToNode(cellView.model as dia.Element)
      }
    })
  }

  /**
   * Handle blank area click (deselect)
   */
  private setupBlankClickHandler(): void {
    this.paper.on('blank:pointerclick', () => {
      if (this.selectedCellView) {
        this.selectedCellView.unhighlight()
        this.selectedCellView = null
        this.onCellViewSelected?.(null)
      }
    })
  }

  /**
   * Get currently selected cell view
   */
  getSelectedCellView(): dia.CellView | null {
    return this.selectedCellView
  }

  /**
   * Programmatically deselect current cell
   */
  deselectCell(): void {
    if (this.selectedCellView) {
      this.selectedCellView.unhighlight()
      this.selectedCellView = null
      this.onCellViewSelected?.(null)
    }
  }

  /**
   * Remove all event listeners (cleanup)
   */
  cleanup(): void {
    this.paper.off('cell:pointerclick')
    this.paper.off('cell:pointerdblclick')
    this.paper.off('blank:pointerclick')
    this.deselectCell()
  }
}
