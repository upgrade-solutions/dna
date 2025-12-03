import { useEffect, useRef, useState } from 'react'
import { dia } from '@joint/plus'
import { dnaPlatformTenant } from '../../../data'
import { resourceToGraph } from '../../../graph/mappers'
import { initializeGraph, cleanupGraph, populateGraph } from '../utils'
import { ShapesFactory } from '../shapes'
import { GraphEventHandler, ZoomHandler, PanHandler, KeyboardHandler } from '../features'
import { GraphToolbar } from '../toolbar/GraphToolbar'
import type { GraphCanvasProps } from '../utils/types'

export type { GraphCanvasProps }

export function GraphCanvas({ 
  width = '100%', 
  height = '100vh',
  tenantConfig = dnaPlatformTenant,
  onCellViewSelected
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const eventHandlerRef = useRef<GraphEventHandler | null>(null)
  const zoomHandlerRef = useRef<ZoomHandler | null>(null)
  const panHandlerRef = useRef<PanHandler | null>(null)
  const keyboardHandlerRef = useRef<KeyboardHandler | null>(null)
  const [graph, setGraph] = useState<dia.Graph | null>(null)
  const [paper, setPaper] = useState<dia.Paper | null>(null)
  const [scale, setScale] = useState(1)

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

    // Setup interaction handlers
    const zoomHandler = new ZoomHandler({
      paper,
      container: containerRef.current,
      minScale: 0.2,
      maxScale: 3,
      zoomFactor: 1.1,
      onScaleChange: setScale
    })
    zoomHandlerRef.current = zoomHandler

    const panHandler = new PanHandler({ paper })
    panHandlerRef.current = panHandler

    const keyboardHandler = new KeyboardHandler({ zoomHandler })
    keyboardHandler.setup()
    keyboardHandlerRef.current = keyboardHandler

    // Mouse wheel: Ctrl/Cmd + scroll = zoom, scroll = pan
    const handleWheel = (evt: WheelEvent) => {
      evt.preventDefault()

      if (evt.ctrlKey || evt.metaKey) {
        // Zoom at cursor position
        const zoomIn = evt.deltaY < 0
        zoomHandler.zoomAtPoint(evt.clientX, evt.clientY, zoomIn)
      } else {
        // Pan
        panHandler.pan(-evt.deltaX, -evt.deltaY)
      }
    }

    // Blank area drag to pan
    const handleBlankPointerDown = (evt: dia.Event, x: number, y: number) => {
      const clientX = (evt as any).clientX || x
      const clientY = (evt as any).clientY || y
      panHandler.startPan(clientX, clientY)
    }

    // Attach event listeners
    containerRef.current.addEventListener('wheel', handleWheel, { passive: false })
    paper.on('blank:pointerdown', handleBlankPointerDown)

    // Cleanup
    return () => {
      containerRef.current?.removeEventListener('wheel', handleWheel)
      paper.off('blank:pointerdown', handleBlankPointerDown)
      keyboardHandler.cleanup()
      panHandler.cleanup()
      eventHandler.cleanup()
      cleanupGraph({ graph, paper })
      eventHandlerRef.current = null
      zoomHandlerRef.current = null
      panHandlerRef.current = null
      keyboardHandlerRef.current = null
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
        scale={scale}
        onScaleChange={setScale}
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