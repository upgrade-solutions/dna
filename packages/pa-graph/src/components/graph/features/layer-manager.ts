import { dia } from '@joint/plus'

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
  private paper: dia.Paper
  private layerConfigs: Map<string, LayerConfig>

  constructor(graph: dia.Graph, paper: dia.Paper) {
    this.graph = graph
    this.paper = paper
    this.layerConfigs = new Map()
    this.initializeDefaultLayers()
  }

  /**
   * Initialize default language and runtime layers
   */
  private initializeDefaultLayers(): void {
    // Language layers (hidden by default)
    this.createLayer('language-typescript', 'TypeScript', 'language', { visible: false })
    this.createLayer('language-javascript', 'JavaScript', 'language', { visible: false })
    this.createLayer('language-python', 'Python', 'language', { visible: false })
    this.createLayer('language-go', 'Go', 'language', { visible: false })
    this.createLayer('language-rust', 'Rust', 'language', { visible: false })
    this.createLayer('language-java', 'Java', 'language', { visible: false })
    this.createLayer('language-csharp', 'C#', 'language', { visible: false })
    this.createLayer('language-php', 'PHP', 'language', { visible: false })
    this.createLayer('language-ruby', 'Ruby', 'language', { visible: false })
    this.createLayer('language-other', 'Other', 'language', { visible: false })

    // Runtime layers (hidden by default)
    this.createLayer('runtime-deno', 'Deno', 'runtime', { visible: false })
    this.createLayer('runtime-nodejs', 'Node.js', 'runtime', { visible: false })
    this.createLayer('runtime-bun', 'Bun', 'runtime', { visible: false })
    this.createLayer('runtime-python', 'Python', 'runtime', { visible: false })
    this.createLayer('runtime-go', 'Go', 'runtime', { visible: false })
    this.createLayer('runtime-docker', 'Docker', 'runtime', { visible: false })
    this.createLayer('runtime-kubernetes', 'Kubernetes', 'runtime', { visible: false })
    this.createLayer('runtime-postgresql', 'PostgreSQL', 'runtime', { visible: false })
    this.createLayer('runtime-mysql', 'MySQL', 'runtime', { visible: false })
    this.createLayer('runtime-mongodb', 'MongoDB', 'runtime', { visible: false })
    this.createLayer('runtime-redis', 'Redis', 'runtime', { visible: false })
    this.createLayer('runtime-rabbitmq', 'RabbitMQ', 'runtime', { visible: false })
    this.createLayer('runtime-kafka', 'Kafka', 'runtime', { visible: false })
    this.createLayer('runtime-other', 'Other', 'runtime', { visible: false })
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

    // Force paper to re-render affected cells
    this.refreshCellVisibility()

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

    // Force paper to re-render affected cells
    this.refreshCellVisibility()
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
   * Refresh cell visibility by triggering a batch update
   * This forces the paper to re-evaluate which cells should be visible
   */
  private refreshCellVisibility(): void {
    // Trigger a batch update to refresh all cell views
    this.graph.getCells().forEach(cell => {
      const view = this.paper.findViewByModel(cell)
      if (view) {
        const visible = this.isCellVisible(cell)
        // Toggle visibility using CSS
        if (view.el) {
          view.el.style.display = visible ? '' : 'none'
        }
      }
    })
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.layerConfigs.clear()
  }
}
