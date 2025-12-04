import { dia, shapes, layout as jointLayout } from '@joint/plus'
import { makeObservable, observable, action, computed } from 'mobx'

/**
 * Available layout algorithms
 */
export type LayoutType = 
  | 'tree'        // TreeLayout (primary)
  | 'grid'        // GridLayout  
  | 'dagre'       // DirectedGraph (future)
  | 'force'       // ForceDirected (future)
  | 'msagl'       // MSAGL (future)
  | 'none'        // Manual positioning only

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
 * Grid layout configuration
 */
export interface GridLayoutOptions {
  columns?: number
  columnWidth?: 'auto' | 'compact' | number
  rowHeight?: 'auto' | 'compact' | number
  columnGap?: number
  rowGap?: number
  verticalAlign?: 'top' | 'middle' | 'bottom'
  horizontalAlign?: 'left' | 'middle' | 'right'
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
  tree?: TreeLayoutOptions
  grid?: GridLayoutOptions
}

/**
 * Default layout configurations
 */
const DEFAULT_TREE_OPTIONS: Required<TreeLayoutOptions> = {
  direction: 'R',
  parentGap: 50,
  siblingGap: 30,
  firstChildGap: 20,
  symmetrical: false,
}

const DEFAULT_GRID_OPTIONS: Required<GridLayoutOptions> = {
  columns: 4,
  columnWidth: 'auto',
  rowHeight: 'auto',
  columnGap: 50,
  rowGap: 50,
  verticalAlign: 'middle',
  horizontalAlign: 'middle',
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
  treeOptions: TreeLayoutOptions
  gridOptions: GridLayoutOptions
  commonOptions: CommonLayoutOptions
  private treeLayoutInstance: jointLayout.TreeLayout | null = null
  private hierarchyLinkIds: string[] = [] // Track hierarchy links for cleanup

  constructor(graph: dia.Graph, initialType: LayoutType = 'tree', layoutMode: LayoutMode = 'tree') {
    this.graph = graph
    this.currentType = initialType
    this.layoutMode = layoutMode
    this.treeOptions = { ...DEFAULT_TREE_OPTIONS }
    this.gridOptions = { ...DEFAULT_GRID_OPTIONS }
    this.commonOptions = { ...DEFAULT_COMMON_OPTIONS }

    makeObservable(this, {
      currentType: observable,
      layoutMode: observable,
      treeOptions: observable,
      gridOptions: observable,
      commonOptions: observable,
      setLayoutType: action,
      setLayoutMode: action,
      setTreeOptions: action,
      setGridOptions: action,
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
      tree: 'Tree (Hierarchical)',
      grid: 'Grid (Uniform)',
      dagre: 'Directed Graph',
      force: 'Force-Directed',
      msagl: 'MSAGL',
      none: 'Manual',
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
   * Set layout mode (nested vs tree)
   */
  setLayoutMode(mode: LayoutMode): void {
    if (mode === this.layoutMode) return
    
    this.layoutMode = mode
    this.rebuildGraphForMode()
  }

  /**
   * Rebuild graph structure when switching between nested and tree modes
   */
  private rebuildGraphForMode(): void {
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
  }

  /**
   * Remove all hierarchy links
   */
  private removeHierarchyLinks(): void {
    this.hierarchyLinkIds.forEach(linkId => {
      const link = this.graph.getCell(linkId)
      if (link) {
        link.remove()
      }
    })
    this.hierarchyLinkIds = []
  }

  /**
   * Get layout-specific configuration
   */
  getLayoutConfig(type: LayoutType): TreeLayoutOptions | GridLayoutOptions {
    switch (type) {
      case 'tree':
        return { ...this.treeOptions }
      case 'grid':
        return { ...this.gridOptions }
      default:
        return {}
    }
  }

  /**
   * Set tree layout options
   */
  setTreeOptions(options: Partial<TreeLayoutOptions>): void {
    this.treeOptions = { ...this.treeOptions, ...options }
  }

  /**
   * Set grid layout options
   */
  setGridOptions(options: Partial<GridLayoutOptions>): void {
    this.gridOptions = { ...this.gridOptions, ...options }
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
    if (options?.tree) {
      this.setTreeOptions(options.tree)
    }
    if (options?.grid) {
      this.setGridOptions(options.grid)
    }
    if (options?.animated !== undefined || options?.duration !== undefined) {
      this.setCommonOptions({
        animated: options.animated,
        duration: options.duration,
      })
    }

    // Apply layout based on type
    switch (layoutType) {
      case 'tree':
        this.applyTreeLayout()
        break
      case 'grid':
        this.applyGridLayout()
        break
      case 'none':
        // Manual positioning - do nothing
        break
      default:
        console.warn(`Layout type "${layoutType}" not yet implemented`)
    }

    // Update current type
    this.currentType = layoutType
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
   * Apply grid layout algorithm
   */
  private applyGridLayout(): void {
    const layoutOptions: any = {
      columns: this.gridOptions.columns,
      columnWidth: this.gridOptions.columnWidth,
      rowHeight: this.gridOptions.rowHeight,
      columnGap: this.gridOptions.columnGap,
      rowGap: this.gridOptions.rowGap,
      verticalAlign: this.gridOptions.verticalAlign,
      horizontalAlign: this.gridOptions.horizontalAlign,
    }

    jointLayout.GridLayout.layout(this.graph, layoutOptions)
  }

  /**
   * Reset layout to defaults
   */
  resetLayout(): void {
    this.treeOptions = { ...DEFAULT_TREE_OPTIONS }
    this.gridOptions = { ...DEFAULT_GRID_OPTIONS }
    this.commonOptions = { ...DEFAULT_COMMON_OPTIONS }
    this.applyLayout()
  }

  /**
   * Get all available layout types
   */
  static getAvailableLayouts(): Array<{ value: LayoutType; label: string; available: boolean }> {
    return [
      { value: 'tree', label: 'Tree (Hierarchical)', available: true },
      { value: 'grid', label: 'Grid (Uniform)', available: true },
      { value: 'dagre', label: 'Directed Graph', available: false },
      { value: 'force', label: 'Force-Directed', available: false },
      { value: 'msagl', label: 'MSAGL', available: false },
      { value: 'none', label: 'Manual', available: true },
    ]
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.treeLayoutInstance = null
  }
}
