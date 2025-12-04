/**
 * Centralized graph actions
 * Reusable functions for graph operations (zoom, selection, etc.)
 */

import { dia } from '@joint/plus'
import { ZOOM_MIN, ZOOM_MAX, PADDING } from './config'

// Selection Actions

export function setSelection(paper: dia.Paper, selection: dia.Cell[]): void {
  paper.removeTools()
  selection.forEach(cell => {
    const cellView = cell.findView(paper)
    if (cellView) {
      cellView.vel.addClass('selected')
    }
  })
}

export function clearSelection(paper: dia.Paper, selection: dia.Cell[]): void {
  paper.removeTools()
  selection.forEach(cell => {
    const cellView = cell.findView(paper)
    if (cellView) {
      cellView.vel.removeClass('selected')
    }
  })
}

export function removeSelection(graph: dia.Graph, selection: dia.Cell[]): void {
  if (selection.length === 0) return
  graph.removeCells(selection)
}

// Zoom Actions

export function zoomIn(paper: dia.Paper): number {
  const currentScale = paper.scale()
  const newScale = Math.min(currentScale.sx * 1.2, ZOOM_MAX)
  paper.scale(newScale, newScale)
  return newScale
}

export function zoomOut(paper: dia.Paper): number {
  const currentScale = paper.scale()
  const newScale = Math.max(currentScale.sx / 1.2, ZOOM_MIN)
  paper.scale(newScale, newScale)
  return newScale
}

export function resetZoom(paper: dia.Paper): number {
  paper.scale(1, 1)
  return 1
}

export function zoomToFit(paper: dia.Paper): number {
  const graph = paper.model
  const elements = graph.getElements()
  
  // Filter to only visible elements
  const visibleElements = elements.filter(el => el.get('visible') !== false)
  
  if (visibleElements.length === 0) {
    // No visible elements, just reset to default
    paper.scale(1, 1)
    return 1
  }
  
  // Calculate bounding box of visible elements manually
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  
  visibleElements.forEach(el => {
    const bbox = el.getBBox()
    minX = Math.min(minX, bbox.x)
    minY = Math.min(minY, bbox.y)
    maxX = Math.max(maxX, bbox.x + bbox.width)
    maxY = Math.max(maxY, bbox.y + bbox.height)
  })
  
  const contentArea = {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
  
  // Fit to the visible content only
  paper.transformToFitContent({
    padding: PADDING,
    maxScale: ZOOM_MAX,
    minScale: ZOOM_MIN,
    contentArea: contentArea
  })
  
  const scale = paper.scale()
  return scale.sx
}

// Paper Actions

export function updateLinksRouting(paper: dia.Paper, graph: dia.Graph): void {
  graph.getLinks().forEach(link => {
    const linkView = link.findView(paper) as dia.LinkView
    if (linkView) {
      linkView.requestConnectionUpdate()
    }
  })
}

// Note: Graph data utility functions (clearGraph, getAllNodes, getAllLinks, getCellById, removeCellById)
// are exported from utils/graph-utils.ts to avoid duplication
