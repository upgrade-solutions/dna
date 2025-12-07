import { dia, shapes } from '@joint/plus'
import { ShapesFactory } from '../shapes'
import type { GraphData } from './types'
import type { LayoutMode } from '../features/layout/layout-manager'

/**
 * Utility functions for graph operations
 */

/**
 * Populate graph with nodes and edges
 * @param layoutMode - 'nested' for container embedding, 'tree' for hierarchical links
 */
export function populateGraph(
  graph: dia.Graph,
  graphData: GraphData,
  shapesFactory: ShapesFactory,
  layoutMode: LayoutMode = 'tree'
): void {
  // In nested mode, reset all positions to (0, 0) since nested layout algorithm will position everything
  const nodesToCreate = layoutMode === 'nested'
    ? graphData.nodes.map(node => ({ ...node, position: { x: 0, y: 0 } }))
    : graphData.nodes
  
  const nodeElements = shapesFactory.createNodes(nodesToCreate)
  const linkElements = shapesFactory.createLinks(graphData.edges)
  
  // Create a map of node IDs for quick lookup
  const nodeIdSet = new Set(nodeElements.map(el => el.id))
  
  // For tree layout, create parent-child links to show hierarchy
  const hierarchyLinks: shapes.standard.Link[] = []
  if (layoutMode === 'tree') {
    nodeElements.forEach(element => {
      const parentId = element.get('parentId')
      // Only create link if both parent and child nodes exist
      if (parentId && nodeIdSet.has(parentId)) {
        // Verify the target (current element) also exists
        if (!nodeIdSet.has(element.id as string)) {
          console.warn('Skipping link - target node not found:', element.id)
          return
        }
        
        // Create a link from parent to child (no label to avoid visual clutter)
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
          z: -1 // Place links behind nodes
        })
        hierarchyLinks.push(link)
      }
    })
  }
  
  // Add all cells to graph
  graph.addCells([...nodeElements, ...linkElements, ...hierarchyLinks])
  
  // For tree layout, ensure no nodes are embedded (they should be connected via links only)
  if (layoutMode === 'tree') {
    nodeElements.forEach(element => {
      const parentId = element.get('parentId')
      if (parentId) {
        const parent = graph.getCell(parentId)
        if (parent && parent.isElement()) {
          // Make sure element is NOT embedded in parent for tree layout
          (parent as dia.Element).unembed(element)
        }
      }
    })
  }
  
  // For nested layout, establish parent-child relationships via embedding
  if (layoutMode === 'nested') {
    nodeElements.forEach(element => {
      const parentId = element.get('parentId')
      if (parentId) {
        const parent = graph.getCell(parentId)
        if (parent && parent.isElement()) {
          (parent as dia.Element).embed(element)
        }
      }
    })
    
    // Note: Do NOT auto-resize containers here
    // The nested layout algorithm (applyNestedLayout) will handle positioning
    // and resizing of containers after this function completes
  }
}

/**
 * Clear all cells from graph
 */
export function clearGraph(graph: dia.Graph): void {
  graph.clear()
}

/**
 * Get cell by ID
 */
export function getCellById(graph: dia.Graph, id: string): dia.Cell | null {
  return graph.getCell(id)
}

/**
 * Remove cell by ID
 */
export function removeCellById(graph: dia.Graph, id: string): void {
  const cell = getCellById(graph, id)
  if (cell) {
    cell.remove()
  }
}

/**
 * Get all nodes (elements) in graph
 */
export function getAllNodes(graph: dia.Graph): dia.Element[] {
  return graph.getElements()
}

/**
 * Get all links in graph
 */
export function getAllLinks(graph: dia.Graph): dia.Link[] {
  return graph.getLinks()
}

/**
 * Center graph content in viewport
 */
export function centerGraph(paper: dia.Paper): void {
  paper.transformToFitContent({
    padding: 50,
    maxScale: 1,
    minScale: 0.1
  })
}
