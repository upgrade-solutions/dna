import { dia } from '@joint/plus'

/**
 * Container node shape for hierarchical resources (Platform, Application, Module).
 * 
 * Displays parent resources that contain child resources using JointJS embedding.
 * Features:
 * - Header bar with title and expand/collapse control
 * - Semi-transparent body to show contained children
 * - Auto-resizing to fit embedded cells
 * - Expand/collapse state management
 * 
 * Markup structure:
 * - body: Main container rectangle (semi-transparent)
 * - header: Top header bar (solid)
 * - label: Container title text
 * - expandIcon: Chevron icon for expand/collapse
 * - contentArea: Area where children render (transparent, non-interactive)
 */
export const ContainerNode = dia.Element.define('dna.ContainerNode', {
  size: { width: 400, height: 200 },  // Wider, shorter default
  expanded: true,  // Start expanded by default
  markup: [
    {
      tagName: 'rect',
      selector: 'body'
    },
    {
      tagName: 'rect',
      selector: 'header'
    },
    {
      tagName: 'text',
      selector: 'label'
    },
    {
      tagName: 'path',
      selector: 'expandIcon'
    },
    {
      tagName: 'rect',
      selector: 'contentArea'
    }
  ],
  attrs: {
    body: {
      width: 'calc(w)',
      height: 'calc(h)',
      fill: 'rgba(31, 41, 55, 0.3)',  // Semi-transparent dark gray
      stroke: '#4b5563',
      strokeWidth: 2,
      rx: 12,
      ry: 12
    },
    header: {
      width: 'calc(w)',
      height: 40,
      fill: '#374151',
      stroke: '#4b5563',
      strokeWidth: 2,
      rx: 12,
      ry: 12,
      // Only round top corners by clipping bottom
      clipPath: 'inset(0 0 12px 0 round 12px 12px 0 0)'
    },
    label: {
      text: 'Container',
      fill: '#ffffff',
      fontSize: 14,
      fontWeight: '700',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      x: 15,  // Left padding
      y: 15,
      textAnchor: 'start',
      textVerticalAnchor: 'middle'
    },
    expandIcon: {
      // Chevron down (expanded state) - positioned relative to width
      d: 'M calc(w-30) 15 L calc(w-20) 25 L calc(w-10) 15',
      stroke: '#9ca3af',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      fill: 'none',
      cursor: 'pointer'
    },
    contentArea: {
      y: 40,
      width: 'calc(w)',
      height: 'calc(h - 40)',
      fill: 'transparent',
      pointerEvents: 'none'  // Allow clicks to pass through to children
    }
  }
}, {
  /**
   * Toggle expand/collapse state
   */
  toggleExpanded(this: dia.Element): void {
    const isExpanded = this.get('expanded')
    this.set('expanded', !isExpanded)
    
    // Update chevron direction (uses calc() for dynamic positioning)
    const chevronPath = isExpanded 
      ? 'M calc(w-30) 25 L calc(w-20) 15 L calc(w-10) 25'  // Up
      : 'M calc(w-30) 15 L calc(w-20) 25 L calc(w-10) 15'  // Down
    
    this.attr('expandIcon/d', chevronPath)
  },

  /**
   * Check if container is expanded
   */
  isExpanded(this: dia.Element): boolean {
    return this.get('expanded') === true
  },

  /**
   * Resize container to fit all embedded cells with padding
   * Only considers VISIBLE children (opacity > 0)
   */
  fitToChildren(this: dia.Element, padding = 20): void {
    const embeddedCells = this.getEmbeddedCells()
    if (embeddedCells.length === 0) return

    // Filter to only visible children
    const visibleChildren = embeddedCells.filter(cell => {
      if (!cell.isElement()) return false
      const opacity = cell.attr('body/opacity')
      return opacity === undefined || opacity === 1
    })

    if (visibleChildren.length === 0) {
      // No visible children, use compact size
      const headerHeight = 40
      this.resize(200, headerHeight + 60)
      return
    }

    // Calculate bounding box of visible children only
    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity

    visibleChildren.forEach(cell => {
      if (cell.isElement()) {
        const bbox = cell.getBBox()
        minX = Math.min(minX, bbox.x)
        minY = Math.min(minY, bbox.y)
        maxX = Math.max(maxX, bbox.x + bbox.width)
        maxY = Math.max(maxY, bbox.y + bbox.height)
      }
    })

    // Size to fit visible children plus padding
    const headerHeight = 40
    const width = maxX - minX + (padding * 2)
    const height = maxY - minY + (padding * 2) + headerHeight

    this.resize(width, height)
  }
})
