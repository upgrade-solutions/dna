import { makeAutoObservable } from 'mobx'
import { dia } from '@joint/plus'
import type { ZoomHandler } from '../components/graph/features'
import { getIconForResourceType } from '../utils/icon-mapper'

/**
 * MobX observable model for the graph state
 * This is the central source of truth for all graph-related state
 */
export class GraphModel {
  graph: dia.Graph | null = null
  paper: dia.Paper | null = null
  zoomHandler: ZoomHandler | null = null
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

  /**
   * Set up listeners for graph changes
   * 
   * Watches for changes to dna/resourceType and automatically updates
   * the cell's icon to match the selected resource type.
   * 
   * This provides reactive icon updates when users change the resource type
   * in the inspector dropdown without requiring manual refresh.
   */
  private setupGraphListeners() {
    if (!this.graph) return

    // Listen for changes to the 'dna' object (which contains resourceType)
    this.graph.on('change:dna', (cell: dia.Cell) => {
      const dnaData = cell.get('dna')
      
      if (dnaData && dnaData.resourceType) {
        this.updateCellIcon(cell, dnaData.resourceType)
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
    } else {
      console.warn(`Element with id ${resourceId} not found`)
    }
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
    this.graph = null
    this.paper = null
    this.zoomHandler = null
    this.selectedCellView = null
    this.scale = 1
  }
}
