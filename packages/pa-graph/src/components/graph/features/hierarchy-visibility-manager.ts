import { dia } from '@joint/plus'

export interface HierarchyVisibilityOptions {
  graph: dia.Graph
  paper: dia.Paper
  enabled?: boolean
}

/**
 * Manages visibility of hierarchical nodes based on zoom level and focus.
 * 
 * Strategy: Only show a node's immediate children, hide grandchildren and deeper.
 * When zoomed out: Show only top-level nodes
 * When focused on a node: Show that node + its children, hide everything else's children
 */
export class HierarchyVisibilityManager {
  private graph: dia.Graph
  private enabled: boolean
  private currentScale: number = 1
  // @ts-expect-error - Track focused node for future enhancements
  private focusedNodeId: string | null = null

  constructor(options: HierarchyVisibilityOptions) {
    this.graph = options.graph
    this.enabled = options.enabled ?? true
  }

  /**
   * Update visibility based on current zoom level
   */
  updateVisibility(scale: number): void {
    if (!this.enabled) return

    this.currentScale = scale
    
    // Always use the "show parents and direct children only" rule
    // This is the core principle: you see a node and hint of its children, but not grandchildren
    this.showParentsAndDirectChildrenOnly()
    
    // Resize all containers after visibility changes
    this.resizeContainers()
  }

  /**
   * Focus on a specific node - show its children, hide other children
   */
  focusOnNode(nodeId: string | null): void {
    if (!this.enabled) return

    this.focusedNodeId = nodeId
    
    if (!nodeId) {
      // No focus, use zoom-based rules
      this.updateVisibility(this.currentScale)
      return
    }

    const focusedElement = this.graph.getCell(nodeId) as dia.Element
    if (!focusedElement || !focusedElement.isElement()) return

    // Get all elements
    const allElements = this.graph.getElements()

    // Hide all children first
    allElements.forEach(element => {
      const parentId = element.get('parentId')
      if (parentId) {
        this.setElementVisibility(element, false)
      }
    })

    // Show the focused node and its direct children
    this.setElementVisibility(focusedElement, true)
    
    // Show direct children of focused node
    const directChildren = allElements.filter(el => el.get('parentId') === nodeId)
    directChildren.forEach(child => {
      this.setElementVisibility(child, true)
    })

    // Show ancestors of focused node (walk up the tree)
    let currentElement = focusedElement
    while (currentElement) {
      this.setElementVisibility(currentElement, true)
      const parentId = currentElement.get('parentId')
      if (!parentId) break
      const parent = this.graph.getCell(parentId)
      if (!parent || !parent.isElement()) break
      currentElement = parent as dia.Element
    }
    
    // Resize containers after focus change
    this.resizeContainers()
  }

  /**
   * Core visibility rule: Show root nodes + their direct children only
   * Hide all grandchildren and deeper descendants
   */
  private showParentsAndDirectChildrenOnly(): void {
    const allElements = this.graph.getElements()
    
    // Group elements by parent
    const byParent = new Map<string | undefined, dia.Element[]>()
    allElements.forEach(element => {
      const parentId = element.get('parentId')
      if (!byParent.has(parentId)) {
        byParent.set(parentId, [])
      }
      byParent.get(parentId)!.push(element)
    })

    // Show root nodes (no parent)
    const rootNodes = byParent.get(undefined) || []
    rootNodes.forEach(root => {
      this.setElementVisibility(root, true)
      
      // Show direct children of root
      const children = byParent.get(root.id.toString()) || []
      children.forEach(child => {
        this.setElementVisibility(child, true)
      })
    })

    // Hide everything that's 2+ levels deep (grandchildren and beyond)
    allElements.forEach(element => {
      const parentId = element.get('parentId')
      if (!parentId) return // Skip roots
      
      // Check if this element's parent has a parent (making this a grandchild)
      const parent = this.graph.getCell(parentId)
      if (parent && parent.isElement()) {
        const grandparentId = (parent as dia.Element).get('parentId')
        if (grandparentId) {
          // This is a grandchild or deeper - hide it
          this.setElementVisibility(element, false)
        }
      }
    })
  }

  /**
   * Set visibility of an element and its associated links
   */
  private setElementVisibility(element: dia.Element, visible: boolean): void {
    const opacity = visible ? 1 : 0
    
    // Update element visibility
    element.attr('body/opacity', opacity)
    element.attr('label/opacity', opacity)
    element.attr('icon/opacity', opacity)
    element.attr('header/opacity', opacity)
    element.attr('expandIcon/opacity', opacity)
    
    // Set pointer events
    element.attr('root/style', `pointer-events: ${visible ? 'auto' : 'none'}`)

    // Update connected links
    const connectedLinks = this.graph.getConnectedLinks(element)
    connectedLinks.forEach(link => {
      // Only show link if both endpoints are visible
      const source = link.getSourceElement()
      const target = link.getTargetElement()
      
      const sourceVisible = source ? this.isElementVisible(source) : true
      const targetVisible = target ? this.isElementVisible(target) : true
      const linkVisible = sourceVisible && targetVisible
      
      link.attr('line/opacity', linkVisible ? 1 : 0)
      link.attr('line/display', linkVisible ? 'block' : 'none')
    })
  }

  /**
   * Check if an element is currently visible
   */
  private isElementVisible(element: dia.Element): boolean {
    const opacity = element.attr('body/opacity')
    return opacity === 1 || opacity === undefined
  }

  /**
   * Resize all container nodes to fit their visible children
   */
  private resizeContainers(): void {
    const allElements = this.graph.getElements()
    
    allElements.forEach(element => {
      const isContainer = element.get('isContainer')
      if (isContainer && typeof (element as any).fitToChildren === 'function') {
        (element as any).fitToChildren(50) // 50px padding
      }
    })
  }

  /**
   * Enable/disable hierarchy visibility management
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    
    if (!enabled) {
      // Show everything
      const allElements = this.graph.getElements()
      allElements.forEach(element => {
        this.setElementVisibility(element, true)
      })
    } else {
      // Apply current rules
      this.updateVisibility(this.currentScale)
    }
  }

  /**
   * Get current enabled state
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Clean up
   */
  cleanup(): void {
    this.focusedNodeId = null
  }
}
