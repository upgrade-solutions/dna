/**
 * Nested Layout Algorithm - Positions children within parent containers
 * 
 * This algorithm recursively lays out embedded elements within their parent containers,
 * then auto-resizes containers to fit their children.
 * 
 * Layout strategy:
 * 1. Start with root containers (no parent)
 * 2. For each container, layout its children in a grid-like pattern
 * 3. Recursively layout nested containers
 * 4. Resize containers to fit all positioned children
 * 5. Reposition parent to account for container resizing
 */

import { dia } from '@joint/plus'
import type { NestedLayoutOptions } from './layout-manager'

/**
 * Apply nested layout to a graph
 * Layouts all root-level containers and their children recursively
 */
export function applyNestedLayout(
  graph: dia.Graph,
  options: Required<NestedLayoutOptions>
): void {
  // Get all root elements (elements with no parent)
  const rootElements = graph.getElements().filter(el => {
    const parentId = el.get('parentId')
    return !parentId || !graph.getCell(parentId)
  })

  // Layout root containers
  const gridSpacing = 100 // Space between root containers
  let currentX = gridSpacing
  let currentY = gridSpacing

  rootElements.forEach((rootElement) => {
    // Position root element
    rootElement.position(currentX, currentY)

    // Layout its children recursively
    if (rootElement.get('isContainer')) {
      layoutContainerChildren(rootElement, options)
    }

    // Move to next position (horizontal flow for roots)
    const bbox = rootElement.getBBox()
    currentX += bbox.width + gridSpacing

    // Wrap to next row if too wide (optional, for many root elements)
    if (currentX > 3000) {
      currentX = gridSpacing
      currentY += 800
    }
  })
}

/**
 * Recursively layout children within a container
 */
function layoutContainerChildren(
  container: dia.Element,
  options: Required<NestedLayoutOptions>
): void {
  const embeddedCells = container.getEmbeddedCells()
  const children = embeddedCells.filter(cell => cell.isElement()) as dia.Element[]

  if (children.length === 0) {
    // No children, use minimum container size
    const style = (container as any).getStyleForLevel()
    if (style && style.minSize) {
      container.resize(style.minSize.width, style.minSize.height)
    }
    return
  }

  const {
    containerPadding,
    levelSpacing,
    siblingSpacing,
    minContainerSize
  } = options

  const headerHeight = 40 // Container header height

  // Position children in grid layout within container
  let currentX = containerPadding
  let currentY = containerPadding + headerHeight
  let rowHeight = 0
  let maxWidth = minContainerSize.width

  // Sort children by hierarchy level to ensure consistent ordering
  const sortedChildren = [...children].sort((a, b) => {
    const levelA = a.get('hierarchyLevel') || 0
    const levelB = b.get('hierarchyLevel') || 0
    return levelA - levelB
  })

  sortedChildren.forEach((child) => {
    // Recursively layout child containers first
    if (child.get('isContainer')) {
      layoutContainerChildren(child, options)
    }

    // Get child size
    const childSize = child.size()

    // Check if we need to wrap to next row
    if (currentX > containerPadding && currentX + childSize.width > maxWidth - containerPadding) {
      // Wrap to next row
      currentX = containerPadding
      currentY += rowHeight + levelSpacing
      rowHeight = 0
    }

    // Position child relative to parent
    child.position(currentX, currentY, { parentRelative: true })

    // Update tracking variables
    rowHeight = Math.max(rowHeight, childSize.height)
    currentX += childSize.width + siblingSpacing
    maxWidth = Math.max(maxWidth, currentX + containerPadding)
  })

  // Calculate final container dimensions
  const finalHeight = currentY + rowHeight + containerPadding
  const finalWidth = Math.max(minContainerSize.width, maxWidth)

  // Resize container to fit all children
  container.resize(finalWidth, finalHeight)
}

/**
 * Fit a single container to its children (used for dynamic resizing)
 */
export function fitContainerToChildren(
  container: dia.Element,
  options: Required<NestedLayoutOptions>
): void {
  if (!container.get('isContainer')) return

  const embeddedCells = container.getEmbeddedCells()
  const children = embeddedCells.filter(cell => cell.isElement()) as dia.Element[]

  if (children.length === 0) {
    const style = (container as any).getStyleForLevel()
    if (style && style.minSize) {
      container.resize(style.minSize.width, style.minSize.height)
    }
    return
  }

  const { containerPadding } = options
  const headerHeight = 40

  // Calculate bounding box of all children (in parent-relative coordinates)
  let minX = Infinity, minY = Infinity
  let maxX = -Infinity, maxY = -Infinity

  children.forEach(child => {
    const pos = child.position()
    const size = child.size()
    
    minX = Math.min(minX, pos.x)
    minY = Math.min(minY, pos.y)
    maxX = Math.max(maxX, pos.x + size.width)
    maxY = Math.max(maxY, pos.y + size.height)
  })

  // Calculate required size
  const width = maxX - minX + (containerPadding * 2)
  const height = maxY + containerPadding + headerHeight

  container.resize(width, height)
}

/**
 * Get optimal grid columns for a given number of children
 * Uses a heuristic to balance rows and columns
 */
export function getOptimalColumns(childCount: number): number {
  if (childCount <= 2) return childCount
  if (childCount <= 4) return 2
  if (childCount <= 9) return 3
  return 4 // Max 4 columns for readability
}

/**
 * Calculate required container size for N children
 * Useful for pre-calculating sizes before layout
 */
export function calculateContainerSize(
  childCount: number,
  averageChildSize: { width: number; height: number },
  options: Required<NestedLayoutOptions>
): { width: number; height: number } {
  const {
    containerPadding,
    levelSpacing,
    siblingSpacing,
    minContainerSize
  } = options

  const headerHeight = 40
  const cols = getOptimalColumns(childCount)
  const rows = Math.ceil(childCount / cols)

  const width = Math.max(
    minContainerSize.width,
    (cols * averageChildSize.width) + ((cols - 1) * siblingSpacing) + (containerPadding * 2)
  )

  const height = Math.max(
    minContainerSize.height,
    headerHeight + (rows * averageChildSize.height) + ((rows - 1) * levelSpacing) + (containerPadding * 2)
  )

  return { width, height }
}
