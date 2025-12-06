import { dia, layout as jointLayout } from '@joint/plus'
import { makeObservable, observable, action, computed } from 'mobx'
import { applyNestedLayout as applyNestedLayoutAlgorithm } from './nested-layout-algorithm'

/**
 * Available layout algorithms
 */
export type LayoutType = 
  | 'nested'      // Nested containers (NEW)
  | 'tree'        // TreeLayout (primary)
  | 'dagre'       // DirectedGraph (future)
  | 'force'       // ForceDirected (future)
  | 'msagl'       // MSAGL (future)

/**
 * Nested layout configuration
 */
export interface NestedLayoutOptions {
  containerPadding?: number      // Padding inside containers
  levelSpacing?: number          // Vertical space between levels
  siblingSpacing?: number        // Horizontal space between siblings
  autoResize?: boolean           // Auto-resize containers to fit children
  collapsible?: boolean          // Allow container collapse/expand
  minContainerSize?: { width: number; height: number }
}

/**
 * Tree layout configuration
 */
export interface TreeLayoutOptions {
  direction?: 'L' | 'R' | 'T' | 'B' | 'TL' | 'TR' | 'BL' | 'BR'
  parentGap?: number
  siblingGap?: number
  firstChildGap?: number
  symmetrical?: boolean
}

/**
 * Common layout options
 */
export interface CommonLayoutOptions {
  animated?: boolean
  duration?: number
}

/**
 * Combined layout configuration
 */
export interface LayoutOptions extends CommonLayoutOptions {
  nested?: NestedLayoutOptions
  tree?: TreeLayoutOptions
}

/**
 * Default layout configurations
 */
const DEFAULT_NESTED_OPTIONS: Required<NestedLayoutOptions> = {
  containerPadding: 50,
  levelSpacing: 40,
  siblingSpacing: 30,
  autoResize: true,
  collapsible: false,
  minContainerSize: { width: 300, height: 200 },
}

const DEFAULT_TREE_OPTIONS: Required<TreeLayoutOptions> = {
  direction: 'R',
  parentGap: 40,
  siblingGap: 40,
  firstChildGap: 20,
  symmetrical: false,
}

const DEFAULT_COMMON_OPTIONS: Required<CommonLayoutOptions> = {
  animated: true,
  duration: 300,
}

/**
 * Layout mode: 'nested' uses embedding (children inside containers)
 *              'tree' uses links (traditional tree with edges)
 */
export type LayoutMode = 'nested' | 'tree'

/**
 * Manages graph layout algorithms and configuration
 * 
 * Responsibilities:
 * - Store current layout type and options
 * - Apply selected layout algorithm to graph
 * - Provide unified API for all layout types
 * - Handle layout-specific configuration
 * - Support layout animations and transitions
 * - Manage layout mode (nested vs tree)
 */
export class LayoutManager {
  private graph: dia.Graph
  currentType: LayoutType
  layoutMode: LayoutMode
  nestedOptions: NestedLayoutOptions
  treeOptions: TreeLayoutOptions
  commonOptions: CommonLayoutOptions
  private treeLayoutInstance: jointLayout.TreeLayout | null = null
  // private hierarchyLinkIds: string[] = [] // TODO: Will be used for dynamic mode switching

  constructor(graph: dia.Graph, initialType: LayoutType = 'tree', layoutMode: LayoutMode = 'tree') {
    this.graph = graph
    this.currentType = initialType
    this.layoutMode = layoutMode
    this.nestedOptions = { ...DEFAULT_NESTED_OPTIONS }
    this.treeOptions = { ...DEFAULT_TREE_OPTIONS }
    this.commonOptions = { ...DEFAULT_COMMON_OPTIONS }

    makeObservable(this, {
      currentType: observable,
      layoutMode: observable,
      nestedOptions: observable,
      treeOptions: observable,
      commonOptions: observable,
      setLayoutType: action,
      setLayoutMode: action,
      setNestedOptions: action,
      setTreeOptions: action,
      setCommonOptions: action,
      applyLayout: action,
      layoutTypeName: computed,
    })
  }

  /**
   * Get current layout type
   */
  getCurrentLayout(): LayoutType {
    return this.currentType
  }

  /**
   * Get friendly layout type name
   */
  get layoutTypeName(): string {
    const names: Record<LayoutType, string> = {
      nested: 'Nested (Containers)',
      tree: 'Tree (Hierarchical)',
      dagre: 'Directed Graph',
      force: 'Force-Directed',
      msagl: 'MSAGL',
    }
    return names[this.currentType]
  }

  /**
   * Set layout type (doesn't apply layout)
   */
  setLayoutType(type: LayoutType): void {
    this.currentType = type
  }

  /**
   * Rebuild graph with new layout type
   * Required when switching to/from nested layout (different node types)
   * 
   * @param type - Target layout type
   * @param graphData - Graph data to rebuild from
   * @param shapesFactory - Factory for creating nodes
   * @param populateGraphFn - Function to populate graph
   * @returns Promise that resolves when rebuild is complete
   */
  async rebuildGraphWithLayout(
    type: LayoutType,
    graphData: any,
    shapesFactory: any,
    populateGraphFn: (graph: dia.Graph, data: any, factory: any, mode: LayoutMode) => void
  ): Promise<void> {
    console.log(`Rebuilding graph for layout type: ${type}`)
    
    // 1. Save current viewport state
    const elements = this.graph.getElements()
    const firstElement = elements[0]
    const savedPosition = firstElement?.position() || { x: 0, y: 0 }
    
    // 2. Clear existing graph
    this.graph.clear()
    
    // 3. Update layout mode based on type
    const newMode: LayoutMode = type === 'nested' ? 'nested' : 'tree'
    shapesFactory.setLayoutMode(newMode)
    this.setLayoutMode(newMode)
    
    // 4. Rebuild graph with new node types
    populateGraphFn(this.graph, graphData, shapesFactory, newMode)
    
    // 5. Apply layout
    this.applyLayout(type)
    
    // 6. Small delay to ensure rendering is complete
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log('Graph rebuild complete')
  }

  /**
   * Check if layout switch requires re-render
   */
  requiresRerender(fromType: LayoutType, toType: LayoutType): boolean {
    if (fromType === toType) return false
    
    // Any switch involving nested layout requires re-render
    return fromType === 'nested' || toType === 'nested'
  }

  /**
   * Set layout mode (nested vs tree)
   * Note: Switching modes requires rebuilding the graph with different node types
   * For now, mode is set at initialization and shouldn't be changed dynamically
   */
  setLayoutMode(mode: LayoutMode): void {
    if (mode === this.layoutMode) return
    
    console.warn('Dynamic layout mode switching requires graph rebuild - not yet implemented')
    this.layoutMode = mode
    // TODO: Implement full graph rebuild with ShapesFactory.setLayoutMode()
    // Future: this.rebuildGraphForMode()
  }

  /**
   * Rebuild graph structure when switching between nested and tree modes
   * TODO: This needs to recreate nodes with appropriate types (ResourceNode vs ContainerNode)
   * For now, layout mode should be set at initialization only
   */
  /* private rebuildGraphForMode(): void {
    const elements = this.graph.getElements()
    
    if (this.layoutMode === 'tree') {
      // Switching to tree mode: unembed children and create hierarchy links
      this.removeHierarchyLinks()
      
      elements.forEach(element => {
        const parentId = element.get('parentId')
        if (parentId) {
          // Unembed from parent
          const parent = this.graph.getCell(parentId)
          if (parent && parent.isElement()) {
            (parent as dia.Element).unembed(element)
          }
          
          // Create hierarchy link
          const link = new shapes.standard.Link({
            source: { id: parentId },
            target: { id: element.id },
            attrs: {
              line: {
                stroke: '#6B7280',
                strokeWidth: 2,
                targetMarker: {
                  type: 'path',
                  d: 'M 10 -5 0 0 10 5 z',
                  fill: '#6B7280'
                }
              }
            },
            labels: [{
              attrs: { text: { text: 'contains', fontSize: 12, fill: '#9CA3AF' } }
            }],
            z: -1
          })
          this.graph.addCell(link)
          this.hierarchyLinkIds.push(link.id as string)
        }
      })
      
      // Apply tree layout
      if (this.currentType === 'tree') {
        this.applyLayout('tree')
      }
    } else {
      // Switching to nested mode: remove hierarchy links and embed children
      this.removeHierarchyLinks()
      
      elements.forEach(element => {
        const parentId = element.get('parentId')
        if (parentId) {
          const parent = this.graph.getCell(parentId)
          if (parent && parent.isElement()) {
            (parent as dia.Element).embed(element)
          }
        }
      })
      
      // Auto-resize containers
      setTimeout(() => {
        elements.forEach(element => {
          const isContainer = element.get('isContainer')
          if (isContainer && typeof (element as any).fitToChildren === 'function') {
            (element as any).fitToChildren(50)
          }
        })
      }, 50)
    }
  } */

  /**
   * Remove all hierarchy links
   * TODO: Will be used when rebuildGraphForMode is implemented
   */
  /* private removeHierarchyLinks(): void {
    this.hierarchyLinkIds.forEach(linkId => {
      const link = this.graph.getCell(linkId)
      if (link) {
        link.remove()
      }
    })
    this.hierarchyLinkIds = []
  } */

  /**
   * Get layout-specific configuration
   */
  getLayoutConfig(type: LayoutType): NestedLayoutOptions | TreeLayoutOptions {
    switch (type) {
      case 'nested':
        return { ...this.nestedOptions }
      case 'tree':
        return { ...this.treeOptions }
      default:
        return {}
    }
  }

  /**
   * Set nested layout options
   */
  setNestedOptions(options: Partial<NestedLayoutOptions>): void {
    this.nestedOptions = { ...this.nestedOptions, ...options }
  }

  /**
   * Set tree layout options
   */
  setTreeOptions(options: Partial<TreeLayoutOptions>): void {
    this.treeOptions = { ...this.treeOptions, ...options }
  }

  /**
   * Set common options (animation, duration)
   */
  setCommonOptions(options: Partial<CommonLayoutOptions>): void {
    this.commonOptions = { ...this.commonOptions, ...options }
  }

  /**
   * Apply current layout to graph
   */
  applyLayout(type?: LayoutType, options?: Partial<LayoutOptions>): void {
    const layoutType = type || this.currentType

    // Update options if provided
    if (options?.nested) {
      this.setNestedOptions(options.nested)
    }
    if (options?.tree) {
      this.setTreeOptions(options.tree)
    }
    if (options?.animated !== undefined || options?.duration !== undefined) {
      this.setCommonOptions({
        animated: options.animated,
        duration: options.duration,
      })
    }

    // Apply layout based on type
    switch (layoutType) {
      case 'nested':
        this.applyNestedLayout()
        break
      case 'tree':
        this.applyTreeLayout()
        break
      default:
        console.warn(`Layout type "${layoutType}" not yet implemented`)
    }

    // Update current type
    this.currentType = layoutType
  }

  /**
   * Apply nested layout algorithm
   * Positions children within parent containers recursively
   */
  private applyNestedLayout(): void {
    // Merge with defaults to ensure all required options are present
    const fullOptions: Required<NestedLayoutOptions> = {
      containerPadding: this.nestedOptions.containerPadding ?? 50,
      levelSpacing: this.nestedOptions.levelSpacing ?? 40,
      siblingSpacing: this.nestedOptions.siblingSpacing ?? 30,
      autoResize: this.nestedOptions.autoResize ?? true,
      collapsible: this.nestedOptions.collapsible ?? false,
      minContainerSize: this.nestedOptions.minContainerSize ?? { width: 300, height: 200 }
    }

    // Apply layout (positions all containers and children)
    applyNestedLayoutAlgorithm(this.graph, fullOptions)

    console.log('Applied nested layout with options:', fullOptions)
  }

  /**
   * Apply tree layout algorithm
   */
  private applyTreeLayout(): void {
    // Always create a fresh TreeLayout instance to ensure clean state
    // This is especially important when switching from other layouts (like Grid)
    this.treeLayoutInstance = new jointLayout.TreeLayout({
      graph: this.graph,
      direction: this.treeOptions.direction,
      parentGap: this.treeOptions.parentGap,
      siblingGap: this.treeOptions.siblingGap,
      firstChildGap: this.treeOptions.firstChildGap,
      symmetrical: this.treeOptions.symmetrical,
    })

    // Apply layout
    const layoutOptions: any = {}
    if (this.commonOptions.animated) {
      layoutOptions.transition = {
        duration: this.commonOptions.duration,
      }
    }

    this.treeLayoutInstance.layout(layoutOptions)
  }

  /**
   * Reset layout to defaults
   */
  resetLayout(): void {
    this.nestedOptions = { ...DEFAULT_NESTED_OPTIONS }
    this.treeOptions = { ...DEFAULT_TREE_OPTIONS }
    this.commonOptions = { ...DEFAULT_COMMON_OPTIONS }
    this.applyLayout()
  }

  /**
   * Get all available layout types
   */
  static getAvailableLayouts(): Array<{ value: LayoutType; label: string; available: boolean; requiresRerender?: boolean }> {
    return [
      { value: 'nested', label: 'Nested (Containers)', available: true, requiresRerender: true },
      { value: 'tree', label: 'Tree (Hierarchical)', available: true },
      { value: 'dagre', label: 'Directed Graph', available: false },
      { value: 'force', label: 'Force-Directed', available: false },
      { value: 'msagl', label: 'MSAGL', available: false },
    ]
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.treeLayoutInstance = null
  }
}
