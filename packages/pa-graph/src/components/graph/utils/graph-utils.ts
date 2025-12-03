import { dia } from '@joint/plus'
import { ShapesFactory } from '../shapes'
import type { GraphData } from './types'

/**
 * Utility functions for graph operations
 */

/**
 * Populate graph with nodes and edges
 */
export function populateGraph(
  graph: dia.Graph,
  graphData: GraphData,
  shapesFactory: ShapesFactory
): void {
  const nodeElements = shapesFactory.createNodes(graphData.nodes)
  const linkElements = shapesFactory.createLinks(graphData.edges)
  
  // Add all cells to graph
  graph.addCells([...nodeElements, ...linkElements])
  
  // Establish parent-child relationships via embedding
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
