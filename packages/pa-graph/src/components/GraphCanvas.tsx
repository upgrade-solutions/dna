import { useEffect, useRef } from 'react'
import { dia, shapes } from '@joint/plus'
import { dnaPlatformTenant } from '../data'
import { resourceToGraph } from '../graph/mappers'

export interface GraphCanvasProps {
  width?: number | string
  height?: number | string
  tenantConfig?: typeof dnaPlatformTenant
  onCellViewSelected?: (cellView: dia.CellView | null) => void
}

export function GraphCanvas({ 
  width = '100%', 
  height = '100vh',
  tenantConfig = dnaPlatformTenant,
  onCellViewSelected
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<dia.Graph | null>(null)
  const paperRef = useRef<dia.Paper | null>(null)
  const selectedCellViewRef = useRef<dia.CellView | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize graph
    const graph = new dia.Graph({}, { cellNamespace: shapes })
    graphRef.current = graph

    // Initialize paper with tenant settings
    const paper = new dia.Paper({
      el: containerRef.current,
      model: graph,
      width: typeof width === 'number' ? width : containerRef.current.offsetWidth,
      height: typeof height === 'number' ? height : containerRef.current.offsetHeight,
      gridSize: tenantConfig.settings?.gridSize || 10,
      drawGrid: tenantConfig.settings?.drawGrid ?? true,
      background: {
        color: tenantConfig.settings?.backgroundColor || '#f8f9fa'
      },
      cellViewNamespace: shapes
    })
    paperRef.current = paper

    // Load tenant data
    const graphData = resourceToGraph(tenantConfig.data)

    // Create nodes from resource data with tenant styles
    const nodeElements = graphData.nodes.map(node => {
      const nodeStyle = tenantConfig.styles.nodes[node.type] || tenantConfig.styles.defaultNode
      
      // Debug: log the icon URL being used
      console.log('Node:', node.label, 'Type:', node.type, 'Icon:', nodeStyle.icon, 'Full nodeStyle:', nodeStyle)

      return new shapes.standard.Rectangle({
        id: node.id,
        position: node.position,
        size: { width: 160, height: 80 },
        markup: [{
          tagName: 'rect',
          selector: 'body'
        }, {
          tagName: 'image',
          selector: 'icon',
          attributes: {
            'preserveAspectRatio': 'xMidYMid'
          }
        }, {
          tagName: 'text',
          selector: 'label'
        }],
        attrs: {
          body: {
            fill: nodeStyle.fill,
            stroke: nodeStyle.stroke,
            strokeWidth: nodeStyle.strokeWidth || 1,
            rx: nodeStyle.rx || 8,
            ry: nodeStyle.ry || 8
          },
          icon: {
            'xlink:href': nodeStyle.icon || 'https://api.iconify.design/mdi/cube-outline.svg?color=white',
            width: 24,
            height: 24,
            x: 68, // (160 - 24) / 2 = 68
            y: 35
          },
          label: {
            text: node.label,
            fill: '#ffffff',
            fontSize: 12,
            fontWeight: '600',
            // Position label at top like fieldset legend
            y: 10,
            textAnchor: 'middle',
            textVerticalAnchor: 'top'
          }
        }
      })
    })

    // Create links from relationship data with tenant styles
    const linkElements = graphData.edges.map(edge => {
      const linkStyle = tenantConfig.styles.links[edge.type] || tenantConfig.styles.defaultLink

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
            stroke: linkStyle.stroke,
            strokeWidth: linkStyle.strokeWidth || 2,
            strokeDasharray: linkStyle.strokeDasharray,
            targetMarker: {
              type: 'path',
              d: 'M 10 -5 0 0 10 5 z',
              fill: linkStyle.stroke
            }
          }
        }
      })
    })

    graph.addCells([...nodeElements, ...linkElements])

    // Handle cell selection
    paper.on('cell:pointerclick', (cellView: dia.CellView) => {
      // Unhighlight previous selection
      if (selectedCellViewRef.current) {
        selectedCellViewRef.current.unhighlight()
      }
      
      // Highlight and track new selection with 2px theme color border (convention)
      cellView.highlight(null, {
        highlighter: {
          name: 'stroke',
          options: {
            padding: 0,
            rx: 8,
            ry: 8,
            attrs: {
              'stroke-width': 2,
              stroke: tenantConfig.styles.nodes[cellView.model.get('type')]?.stroke || '#3b82f6'
            }
          }
        }
      })
      selectedCellViewRef.current = cellView
      onCellViewSelected?.(cellView)
    })

    // Handle blank area click (deselect)
    paper.on('blank:pointerclick', () => {
      if (selectedCellViewRef.current) {
        selectedCellViewRef.current.unhighlight()
        selectedCellViewRef.current = null
        onCellViewSelected?.(null)
      }
    })

    // Cleanup
    return () => {
      paper.remove()
      graph.clear()
    }
  }, [width, height, tenantConfig, onCellViewSelected])

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
