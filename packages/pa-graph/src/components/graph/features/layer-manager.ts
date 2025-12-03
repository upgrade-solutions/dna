import { dia } from '@joint/plus'
import { LanguageBadgeDecorator, RuntimeBadgeDecorator, type CellDecorator } from './decorators'

export interface LayerConfig {
  id: string
  name: string
  visible: boolean
  locked: boolean
  category: 'language' | 'runtime'
}

/**
 * Manages graph layers for organizing and filtering cells by resource type, language, and runtime
 * This implementation uses cell attributes to simulate layers (compatible with all JointJS versions)
 */
export class LayerManager {
  private graph: dia.Graph
  private layerConfigs: Map<string, LayerConfig>
  private decorators: Map<string, CellDecorator>

  constructor(graph: dia.Graph, _paper: dia.Paper) {
    this.graph = graph
    this.layerConfigs = new Map()
    this.decorators = new Map()
    this.initializeDefaultLayers()
    this.initializeDecorators()
  }

  /**
   * Initialize decorators for each layer type
   */
  private initializeDecorators(): void {
    this.decorators.set('language', new LanguageBadgeDecorator())
    this.decorators.set('runtime', new RuntimeBadgeDecorator())
  }

  /**
   * Initialize default language and runtime layers
   */
  private initializeDefaultLayers(): void {
    // Single language layer - controls visibility of all language badges
    this.createLayer('language', 'Language', 'language', { visible: false })
    
    // Single runtime layer - controls visibility of all runtime badges
    this.createLayer('runtime', 'Runtime', 'runtime', { visible: false })
  }

  /**
   * Create a new layer
   */
  createLayer(id: string, name: string, category: LayerConfig['category'], options?: Partial<Omit<LayerConfig, 'id' | 'name' | 'category'>>): void {
    // Check if layer already exists
    if (this.layerConfigs.has(id)) {
      return
    }

    // Create layer config
    const config: LayerConfig = {
      id,
      name,
      category,
      visible: options?.visible ?? true,
      locked: options?.locked ?? false
    }

    this.layerConfigs.set(id, config)
  }

  /**
   * Get layer config
   */
  getLayer(id: string): LayerConfig | undefined {
    return this.layerConfigs.get(id)
  }

  /**
   * Get all layers
   */
  getAllLayers(): LayerConfig[] {
    return Array.from(this.layerConfigs.values())
  }

  /**
   * Get layers by category
   */
  getLayersByCategory(category: LayerConfig['category']): LayerConfig[] {
    return Array.from(this.layerConfigs.values()).filter(
      config => config.category === category
    )
  }

  /**
   * Toggle layer visibility
   */
  toggleLayerVisibility(layerId: string): boolean {
    const config = this.layerConfigs.get(layerId)
    
    if (!config) {
      console.warn(`Layer ${layerId} not found`)
      return false
    }

    const newVisibility = !config.visible
    config.visible = newVisibility

    // Apply or remove decorators based on new visibility
    const decorator = this.decorators.get(layerId)
    if (decorator) {
      const cells = this.graph.getCells()

      cells.forEach(cell => {
        if (newVisibility) {
          decorator.apply(cell)
        } else {
          decorator.remove(cell)
        }
      })
    } else {
      console.warn('[LayerManager] No decorator found for layer:', layerId)
    }

    return newVisibility
  }

  /**
   * Set layer visibility
   */
  setLayerVisibility(layerId: string, visible: boolean): void {
    const config = this.layerConfigs.get(layerId)
    
    if (!config) {
      console.warn(`Layer ${layerId} not found`)
      return
    }

    config.visible = visible

    // Apply or remove decorators based on visibility
    const decorator = this.decorators.get(layerId)
    if (decorator) {
      this.graph.getCells().forEach(cell => {
        if (visible) {
          decorator.apply(cell)
        } else {
          decorator.remove(cell)
        }
      })
    }
  }

  /**
   * Set layer locked state
   */
  setLayerLocked(layerId: string, locked: boolean): void {
    const config = this.layerConfigs.get(layerId)
    
    if (!config) {
      console.warn(`Layer ${layerId} not found`)
      return
    }

    config.locked = locked
  }

  /**
   * Assign a cell to a layer by setting a custom attribute
   */
  assignCellToLayer(cell: dia.Cell, layerId: string): void {
    const config = this.layerConfigs.get(layerId)
    
    if (!config) {
      console.warn(`Layer ${layerId} not found`)
      return
    }

    // Store layer ID in cell's custom data
    cell.set('layerId', layerId, { silent: false })
  }

  /**
   * Get all cells in a layer
   */
  getCellsInLayer(layerId: string): dia.Cell[] {
    return this.graph.getCells().filter(cell => cell.get('layerId') === layerId)
  }

  /**
   * Count cells in a layer
   */
  countCellsInLayer(layerId: string): number {
    return this.getCellsInLayer(layerId).length
  }

  /**
   * Count cells that have a specific property (language or runtime)
   */
  countCellsWithProperty(property: 'language' | 'runtime'): number {
    return this.graph.getCells().filter(cell => {
      if (cell.isLink()) return false
      const dna = cell.get('dna')
      return dna && dna[property] !== undefined && dna[property] !== null
    }).length
  }

  /**
   * Check if a cell is visible based on its layer
   */
  isCellVisible(cell: dia.Cell): boolean {
    const layerId = cell.get('layerId')
    if (!layerId) return true // Cells without a layer are always visible
    
    const config = this.layerConfigs.get(layerId)
    return config?.visible ?? true
  }

  /**
   * Show only specific layers (hide all others)
   */
  showOnlyLayers(layerIds: string[]): void {
    const layerIdSet = new Set(layerIds)
    
    for (const [id] of this.layerConfigs) {
      const shouldBeVisible = layerIdSet.has(id)
      this.setLayerVisibility(id, shouldBeVisible)
    }
  }

  /**
   * Show all layers
   */
  showAllLayers(): void {
    for (const id of this.layerConfigs.keys()) {
      this.setLayerVisibility(id, true)
    }
  }

  /**
   * Hide all layers
   */
  hideAllLayers(): void {
    for (const id of this.layerConfigs.keys()) {
      this.setLayerVisibility(id, false)
    }
  }

  /**
   * Get visible layers
   */
  getVisibleLayers(): LayerConfig[] {
    return Array.from(this.layerConfigs.values()).filter(config => config.visible)
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.layerConfigs.clear()
    this.decorators.clear()
  }
}
