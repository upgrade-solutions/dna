import { useEffect, useRef } from 'react'
import { dia, shapes } from '@joint/plus'
import styles from './GraphCanvas.module.css'

interface Node {
  id: string
  x: number
  y: number
  width?: number
  height?: number
  label: string
  color?: string
}

interface Link {
  id: string
  source: string
  target: string
  color?: string
}

interface GraphData {
  nodes: Node[]
  links: Link[]
}

interface GraphCanvasProps {
  editable?: boolean
  zoom?: boolean
  pan?: boolean
  grid?: boolean
  snapToGrid?: boolean
  data?: GraphData
  dataSource?: string | null
}

export function GraphCanvas({ 
  editable = true,
  grid = true,
  data,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<dia.Graph | null>(null)
  const paperRef = useRef<dia.Paper | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()

    // If no dimensions yet, wait for next frame
    if (rect.width === 0 || rect.height === 0) {
      return
    }

    // Create graph
    const graph = new dia.Graph({}, { cellNamespace: shapes })
    graphRef.current = graph

    // Create paper with explicit dimensions
    const paper = new dia.Paper({
      el: canvasRef.current,
      model: graph,
      width: rect.width,
      height: rect.height,
      gridSize: grid ? 10 : 1,
      drawGrid: grid,
      background: {
        color: '#1a1a1a'
      },
      interactive: editable,
      cellViewNamespace: shapes
    })
    paperRef.current = paper

    // Load data if provided
    if (data && data.nodes && data.nodes.length > 0) {
      const nodeMap = new Map<string, dia.Element>()

      // Create nodes
      data.nodes.forEach(node => {
        const rect = new shapes.standard.Rectangle({
          id: node.id,
          position: { x: node.x, y: node.y },
          size: { 
            width: node.width || 120, 
            height: node.height || 60 
          },
          attrs: {
            body: {
              fill: node.color || '#3b82f6',
              stroke: '#1e40af',
              strokeWidth: 2
            },
            label: {
              text: node.label,
              fill: '#ffffff'
            }
          }
        })
        nodeMap.set(node.id, rect)
      })

      // Create links
      const linkElements = data.links.map(link => 
        new shapes.standard.Link({
          id: link.id,
          source: { id: link.source },
          target: { id: link.target },
          attrs: {
            line: {
              stroke: link.color || '#6b7280',
              strokeWidth: 2
            }
          }
        })
      )

      graph.addCells([...Array.from(nodeMap.values()), ...linkElements])
    }

    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current && paperRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        paperRef.current.setDimensions(rect.width, rect.height)
      }
    }
    
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      paper.remove()
      graph.clear()
    }
  }, [editable, grid, data])

  return (
    <div 
      ref={canvasRef} 
      className={styles['graph-canvas']}
      style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden'
      }}
    />
  )
}
