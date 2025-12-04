import { makeAutoObservable } from 'mobx'
import { dia } from '@joint/plus'
import type { ZoomHandler } from '../components/graph/features/interaction'
import type { OverlayManager } from '../components/graph/features/overlays'
import type { HierarchyVisibilityManager, LayoutManager } from '../components/graph/features/layout'
import type { CategoryId } from '../components/graph/features/overlays/layer-types'
import { getIconForResourceType } from '../utils/icon-mapper'

/**
 * MobX observable model for the graph state
 * This is the central source of truth for all graph-related state
 */
export class GraphModel {
  graph: dia.Graph | null = null
  paper: dia.Paper | null = null
  zoomHandler: ZoomHandler | null = null
  overlayManager: OverlayManager | null = null
  layoutManager: LayoutManager | null = null
  hierarchyVisibilityManager: HierarchyVisibilityManager | null = null
  selectedCellView: dia.CellView | null = null
  scale: number = 1

  constructor() {
    makeAutoObservable(this)
  }

  /**
   * Initialize the graph and paper instances
   */
  setGraph(graph: dia.Graph) {
    this.graph = graph
    this.setupGraphListeners()
  }

  setPaper(paper: dia.Paper) {
    this.paper = paper
  }

  setZoomHandler(zoomHandler: ZoomHandler) {
    this.zoomHandler = zoomHandler
  }

  setOverlayManager(overlayManager: OverlayManager) {
    this.overlayManager = overlayManager
  }

  setLayoutManager(layoutManager: LayoutManager) {
    this.layoutManager = layoutManager
  }

  setHierarchyVisibilityManager(manager: HierarchyVisibilityManager) {
    this.hierarchyVisibilityManager = manager
  }

  /**
   * Toggle category visibility
   */
  toggleCategory(categoryId: CategoryId): boolean {
    if (!this.overlayManager) {
      console.warn('OverlayManager not initialized')
      return false
    }
    return this.overlayManager.toggleCategory(categoryId)
  }

  /**
   * Set active concern for a category
   */
  setActiveConcern(categoryId: CategoryId, concernId: string) {
    if (!this.overlayManager) {
      console.warn('OverlayManager not initialized')
      return
    }
    this.overlayManager.setActiveConcern(categoryId, concernId)
  }

  /**
   * Get all categories
   */
  getAllCategories() {
    return this.overlayManager?.getAllCategories() || []
  }

  /**
   * Enable a category
   */
  enableCategory(categoryId: CategoryId) {
    this.overlayManager?.enableCategory(categoryId)
  }

  /**
   * Disable a category
   */
  disableCategory(categoryId: CategoryId) {
    this.overlayManager?.disableCategory(categoryId)
  }

  /**
   * Set up listeners for graph changes
   * 
   * Watches for changes to dna/resourceType and automatically updates
   * the cell's icon to match the selected resource type.
   * 
   * Also watches for any DNA changes to refresh category badges/overlays.
   * 
   * This provides reactive icon updates when users change the resource type
   * in the inspector dropdown without requiring manual refresh.
   */
  private setupGraphListeners() {
    if (!this.graph) return

    // Listen for changes to the 'dna' object (which contains resourceType and all DNA properties)
    this.graph.on('change:dna', (cell: dia.Cell) => {
      const dnaData = cell.get('dna')
      
      if (dnaData && dnaData.resourceType) {
        this.updateCellIcon(cell, dnaData.resourceType)
      }

      // Refresh overlay badges for this cell when DNA properties change
      // This ensures badges update when user changes properties like language, status, owner, etc.
      if (this.overlayManager) {
        this.overlayManager.refreshDecorators()
      }
    })
  }

  /**
   * Update a cell's icon based on its resource type
   * 
   * Maps resource types (api, database, service, etc.) to their
   * corresponding Iconify icons and updates the cell's visual representation.
   */
  updateCellIcon(cell: dia.Cell, resourceType: string) {
    const iconUrl = getIconForResourceType(resourceType)
    cell.attr('icon/xlink:href', iconUrl)
  }

  /**
   * Update the selected cell view
   */
  setSelectedCellView(cellView: dia.CellView | null) {
    this.selectedCellView = cellView
  }

  /**
   * Update the current zoom scale
   */
  setScale(scale: number) {
    this.scale = scale
    // Update hierarchy visibility based on new zoom level
    this.hierarchyVisibilityManager?.updateVisibility(scale)
  }

  /**
   * Zoom to a specific node by resource ID
   */
  zoomToResource(resourceId: string) {
    if (!this.graph || !this.zoomHandler) {
      console.warn('Graph or zoom handler not initialized')
      return
    }

    // Find the element with matching ID
    const element = this.graph.getElements().find(el => el.id === resourceId)

    if (element) {
      this.zoomHandler.zoomToNode(element)
      // Focus on this node to show its children
      this.hierarchyVisibilityManager?.focusOnNode(resourceId)
    } else {
      console.warn(`Element with id ${resourceId} not found`)
    }
  }

  /**
   * Focus on a specific node - show its children, hide others
   */
  focusOnNode(nodeId: string | null) {
    this.hierarchyVisibilityManager?.focusOnNode(nodeId)
  }

  /**
   * Get all elements in the graph
   */
  get elements() {
    return this.graph?.getElements() || []
  }

  /**
   * Get all links in the graph
   */
  get links() {
    return this.graph?.getLinks() || []
  }

  /**
   * Clean up the model
   */
  cleanup() {
    this.overlayManager?.cleanup()
    this.hierarchyVisibilityManager?.cleanup()
    this.graph = null
    this.paper = null
    this.zoomHandler = null
    this.overlayManager = null
    this.hierarchyVisibilityManager = null
    this.selectedCellView = null
    this.scale = 1
  }
}
