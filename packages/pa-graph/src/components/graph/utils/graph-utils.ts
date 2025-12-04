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
  const nodeElements = shapesFactory.createNodes(graphData.nodes)
  const linkElements = shapesFactory.createLinks(graphData.edges)
  
  // For tree layout, create parent-child links to show hierarchy
  const hierarchyLinks: shapes.standard.Link[] = []
  if (layoutMode === 'tree') {
    nodeElements.forEach(element => {
      const parentId = element.get('parentId')
      if (parentId) {
        // Create a link from parent to child
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
          z: -1 // Place links behind nodes
        })
        hierarchyLinks.push(link)
      }
    })
  }
  
  // Add all cells to graph
  graph.addCells([...nodeElements, ...linkElements, ...hierarchyLinks])
  
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
    
    // Auto-resize container nodes to fit their children
    // Do this after a short delay to ensure all children are positioned
    nodeElements.forEach(element => {
      const isContainer = element.get('isContainer')
      if (isContainer && typeof (element as any).fitToChildren === 'function') {
        setTimeout(() => {
          (element as any).fitToChildren(50) // 50px padding for better spacing
        }, 50)
      }
    })
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
