import { useEffect, useRef, useState } from 'react'
import { dia } from '@joint/plus'
import { dnaPlatformTenant } from '../../../data'
import { resourceToGraph } from '../../../graph/mappers'
import { initializeGraph, cleanupGraph } from './graph-init'
import { ShapesFactory } from './shapes-factory'
import { GraphEventHandler } from './event-handler'
import { populateGraph } from './utils'
import { GraphToolbar } from '../toolbar/GraphToolbar'
import type { GraphCanvasProps } from './types'

export type { GraphCanvasProps }

export function GraphCanvas({ 
  width = '100%', 
  height = '100vh',
  tenantConfig = dnaPlatformTenant,
  onCellViewSelected
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const eventHandlerRef = useRef<GraphEventHandler | null>(null)
  const [graph, setGraph] = useState<dia.Graph | null>(null)
  const [paper, setPaper] = useState<dia.Paper | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize graph and paper
    const { graph, paper } = initializeGraph({
      container: containerRef.current,
      width,
      height,
      tenantConfig
    })

    // Store graph and paper in state for toolbar
    setGraph(graph)
    setPaper(paper)

    // Create shapes factory for cell creation
    const shapesFactory = new ShapesFactory(tenantConfig)

    // Load and populate graph with tenant data
    const graphData = resourceToGraph(tenantConfig.data)
    populateGraph(graph, graphData, shapesFactory)

    // Setup event handlers
    const eventHandler = new GraphEventHandler(paper, tenantConfig, onCellViewSelected)
    eventHandler.setupEvents()
    eventHandlerRef.current = eventHandler

    // Enable mouse wheel zoom
    let isPanning = false
    let startPan = { x: 0, y: 0 }

    const handleWheel = (evt: WheelEvent) => {
      evt.preventDefault()
      const oldScale = paper.scale()
      const delta = evt.deltaY > 0 ? 0.9 : 1.1
      const newScale = oldScale.sx * delta
      
      // Limit scale between 0.2 and 3
      if (newScale >= 0.2 && newScale <= 3) {
        const mousePosition = { x: evt.offsetX, y: evt.offsetY }
        paper.scale(newScale, newScale, mousePosition.x, mousePosition.y)
      }
    }

    // Enable panning with blank paper drag
    const handleBlankPointerDown = (evt: dia.Event) => {
      isPanning = true
      startPan = { x: evt.clientX, y: evt.clientY }
      paper.el.style.cursor = 'grabbing'
    }

    const handleMouseMove = (evt: MouseEvent) => {
      if (!isPanning) return
      const dx = evt.clientX - startPan.x
      const dy = evt.clientY - startPan.y
      
      // Get current translation and add the delta
      const currentTranslate = paper.translate()
      paper.translate(currentTranslate.tx + dx, currentTranslate.ty + dy)
      
      startPan = { x: evt.clientX, y: evt.clientY }
    }

    const handleMouseUp = () => {
      if (isPanning) {
        isPanning = false
        paper.el.style.cursor = 'default'
      }
    }

    // Attach wheel event for zooming
    containerRef.current.addEventListener('wheel', handleWheel, { passive: false })
    
    // Attach panning events
    paper.on('blank:pointerdown', handleBlankPointerDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // Cleanup
    return () => {
      containerRef.current?.removeEventListener('wheel', handleWheel)
      paper.off('blank:pointerdown', handleBlankPointerDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      eventHandler.cleanup()
      cleanupGraph({ graph, paper })
      eventHandlerRef.current = null
      setGraph(null)
      setPaper(null)
    }
  }, [width, height, tenantConfig, onCellViewSelected])

  return (
    <div 
      style={{ 
        position: 'relative',
        width: typeof width === 'string' ? width : `${width}px`,
        height: typeof height === 'string' ? height : `${height}px`
      }}
    >
      <GraphToolbar 
        graph={graph} 
        paper={paper}
      />
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%',
          height: 'calc(100% - 44px)',
          marginTop: '44px'
        }}
      />
    </div>
  )
}
