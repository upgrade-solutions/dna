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

import { dia, layout as jointLayout } from '@joint/plus'
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
    // Position root element (absolute)
    rootElement.position(currentX, currentY)

    // Layout its children recursively (parent-relative positioning)
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
  
  console.log('[Nested Layout] Layout complete')
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
    container.resize(options.minContainerSize.width, options.minContainerSize.height)
    return
  }

  const padding = options.containerPadding
  const headerHeight = 40
  
  // Pre-pass: Resize leaf containers to their minimum size before positioning
  children.forEach(child => {
    const embeddedCells = child.getEmbeddedCells()
    const hasChildren = embeddedCells.filter(cell => cell.isElement()).length > 0
    
    if (!hasChildren && child.get('isContainer')) {
      // Leaf container with no children - resize to minContainerSize
      child.resize(options.minContainerSize.width, options.minContainerSize.height)
    }
  })
  
  // Position children starting at (padding, headerHeight + padding) in parent-relative coordinates
  const startX = padding
  const startY = padding
  const columns = 3
  const marginX = options.siblingSpacing
  const marginY = options.levelSpacing
  
  console.log(`[Nested Layout] Container ${container.id}: positioning ${children.length} children`)
  console.log(`[Nested Layout]   startX: ${startX}, startY: ${startY}, padding: ${padding}`)
  console.log(`[Nested Layout]   container position:`, container.position())
  
  // Get container's absolute position to understand coordinate space
  const containerAbsPos = container.position()
  
  // Track current position for each row
  const rowPositions: { x: number; y: number; maxHeight: number }[] = []
  
  // First pass: Position all children
  children.forEach((child, index) => {
    const col = index % columns
    const row = Math.floor(index / columns)
    
    const childSize = child.size()
    const childBBox = child.getBBox()
    console.log(`[Nested Layout]   child ${index} size vs bbox: size=${childSize.width}x${childSize.height}, bbox=${childBBox.width}x${childBBox.height}`)
    
    // Initialize row if needed
    if (!rowPositions[row]) {
      const prevRow = row > 0 ? rowPositions[row - 1] : null
      rowPositions[row] = {
        x: startX,
        y: prevRow ? prevRow.y + prevRow.maxHeight + marginY : startY,
        maxHeight: 0
      }
    }
    
    const x = rowPositions[row].x
    const y = rowPositions[row].y
    
    console.log(`[Nested Layout]   child ${index} (${child.id}): col=${col}, row=${row}, size=${childSize.width}x${childSize.height}, x=${x}, y=${y}`)
    console.log(`[Nested Layout]   rowPositions[${row}].x = ${rowPositions[row].x} BEFORE positioning`)
    
    // Set position as parent-relative (JointJS will handle the coordinate conversion)
    child.position(x, y, { parentRelative: true })
    
    const actualPos = child.position()
    console.log(`[Nested Layout]   child ${index} actual position after setting (absolute):`, actualPos)
    
    // Update position for next child in row
    console.log(`[Nested Layout]   Adding to rowPositions[${row}].x: ${childSize.width} + ${marginX} = ${childSize.width + marginX}`)
    rowPositions[row].x += childSize.width + marginX
    console.log(`[Nested Layout]   rowPositions[${row}].x = ${rowPositions[row].x} AFTER update`)
    rowPositions[row].maxHeight = Math.max(rowPositions[row].maxHeight, childSize.height)
  })
  
  // Second pass: Recursively layout child containers now that they're positioned
  children.forEach(child => {
    if (child.get('isContainer')) {
      layoutContainerChildren(child, options)
    }
  })

  // Calculate the required container size based on the PARENT-RELATIVE positions we set
  // (not the absolute positions returned by position())
  let maxX = startX
  let maxY = startY
  
  rowPositions.forEach((row, rowIndex) => {
    // For each row, the rightmost position is tracked in row.x (after all children)
    // But we need to subtract the last margin we added
    if (rowPositions[rowIndex]) {
      maxY = Math.max(maxY, row.y + row.maxHeight)
    }
  })
  
  // Get the rightmost child's position in parent-relative coords
  children.forEach((child, index) => {
    const col = index % columns
    const row = Math.floor(index / columns)
    const size = child.size()
    
    // Recalculate the parent-relative position (same logic as above)
    let childX = startX
    for (let i = 0; i < col; i++) {
      const prevChild = children[row * columns + i]
      if (prevChild) {
        childX += prevChild.size().width + marginX
      }
    }
    
    maxX = Math.max(maxX, childX + size.width)
  })
  
  const width = Math.max(
    options.minContainerSize.width,
    maxX + padding
  )
  const height = Math.max(
    options.minContainerSize.height,
    maxY + padding
  )
  
  console.log(`[Nested Layout] Container ${container.id}: resizing to ${width}x${height} (maxX: ${maxX}, maxY: ${maxY})`)
  
  container.resize(width, height)
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
