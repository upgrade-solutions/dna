import { useEffect, useRef } from 'react'
import { dia, shapes } from '@joint/plus'
import { exampleWebApp } from '../data'
import { resourceToGraph } from '../graph/mappers'

export interface GraphCanvasProps {
  width?: number | string
  height?: number | string
}

export function GraphCanvas({ width = '100%', height = '100vh' }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<dia.Graph | null>(null)
  const paperRef = useRef<dia.Paper | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize graph
    const graph = new dia.Graph({}, { cellNamespace: shapes })
    graphRef.current = graph

    // Initialize paper
    const paper = new dia.Paper({
      el: containerRef.current,
      model: graph,
      width: typeof width === 'number' ? width : containerRef.current.offsetWidth,
      height: typeof height === 'number' ? height : containerRef.current.offsetHeight,
      gridSize: 10,
      drawGrid: true,
      background: {
        color: '#f8f9fa'
      },
      cellViewNamespace: shapes
    })
    paperRef.current = paper

    // Load example resource data
    const graphData = resourceToGraph(exampleWebApp)

    // Create nodes from resource data
    const nodeElements = graphData.nodes.map(node => {
      // Map node type to visual style
      const nodeStyles = {
        'web-app': { fill: '#3b82f6', stroke: '#1e40af' },
        'api': { fill: '#10b981', stroke: '#047857' },
        'database': { fill: '#f59e0b', stroke: '#d97706' },
        'service': { fill: '#8b5cf6', stroke: '#6d28d9' },
        'form': { fill: '#ec4899', stroke: '#db2777' },
        'ui-component': { fill: '#06b6d4', stroke: '#0891b2' }
      }

      const style = nodeStyles[node.type as keyof typeof nodeStyles] || { fill: '#6b7280', stroke: '#4b5563' }

      return new shapes.standard.Rectangle({
        id: node.id,
        position: node.position,
        size: { width: 160, height: 80 },
        attrs: {
          body: {
            fill: style.fill,
            stroke: style.stroke,
            strokeWidth: 2,
            rx: 8,
            ry: 8
          },
          label: {
            text: node.label,
            fill: '#ffffff',
            fontSize: 13,
            fontWeight: 'bold'
          }
        }
      })
    })

    // Create links from relationship data
    const linkElements = graphData.edges.map(edge => {
      return new shapes.standard.Link({
        id: edge.id,
        source: { id: edge.source },
        target: { id: edge.target },
        labels: edge.label ? [{ 
          attrs: { 
            text: { 
              text: edge.label,
              fill: '#4b5563',
              fontSize: 11
            } 
          } 
        }] : [],
        attrs: {
          line: {
            stroke: '#6b7280',
            strokeWidth: 2,
            targetMarker: {
              type: 'path',
              d: 'M 10 -5 0 0 10 5 z',
              fill: '#6b7280'
            }
          }
        }
      })
    })

    graph.addCells([...nodeElements, ...linkElements])

    // Cleanup
    return () => {
      paper.remove()
      graph.clear()
    }
  }, [width, height])

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: typeof width === 'string' ? width : `${width}px`,
        height: typeof height === 'string' ? height : `${height}px`
      }}
    />
  )
}
