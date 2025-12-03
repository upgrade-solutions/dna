import { useEffect, useRef } from 'react'
import { dia } from '@joint/plus'
import { observer } from 'mobx-react-lite'
import { dnaPlatformTenant } from '../../../data'
import { resourceToGraph } from '../../../graph/mappers'
import { initializeGraph, cleanupGraph, populateGraph } from '../utils'
import { ShapesFactory } from '../shapes'
import { GraphEventHandler, ZoomHandler, PanHandler, KeyboardHandler } from '../features'
import { GraphToolbar } from '../toolbar/GraphToolbar'
import { GraphModel } from '../../../models'
import type { GraphCanvasProps } from '../utils/types'

export type { GraphCanvasProps }

interface GraphCanvasPropsWithModel extends Omit<GraphCanvasProps, 'onCellViewSelected'> {
  model: GraphModel
}

export const GraphCanvas = observer(function GraphCanvas({ 
  width = '100%', 
  height = '100vh',
  tenantConfig = dnaPlatformTenant,
  model
}: GraphCanvasPropsWithModel) {
  const containerRef = useRef<HTMLDivElement>(null)
  const eventHandlerRef = useRef<GraphEventHandler | null>(null)
  const panHandlerRef = useRef<PanHandler | null>(null)
  const keyboardHandlerRef = useRef<KeyboardHandler | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize graph and paper
    const { graph, paper } = initializeGraph({
      container: containerRef.current,
      width,
      height,
      tenantConfig
    })

    // Store in MobX model
    model.setGraph(graph)
    model.setPaper(paper)

    // Create shapes factory for cell creation
    const shapesFactory = new ShapesFactory(tenantConfig)

    // Load and populate graph with tenant data
    const graphData = resourceToGraph(tenantConfig.data)
    populateGraph(graph, graphData, shapesFactory)

    // Setup interaction handlers (zoom handler needed for event handler)
    const zoomHandler = new ZoomHandler({
      paper,
      container: containerRef.current,
      minScale: 0.2,
      maxScale: 3,
      zoomFactor: 1.1,
      onScaleChange: (scale) => model.setScale(scale)
    })
    model.setZoomHandler(zoomHandler)

    // Setup event handlers (pass zoom handler for double-click zoom)
    const eventHandler = new GraphEventHandler(
      paper, 
      tenantConfig, 
      (cellView) => model.setSelectedCellView(cellView),
      zoomHandler
    )
    eventHandler.setupEvents()
    eventHandlerRef.current = eventHandler

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
      model.cleanup()
      eventHandlerRef.current = null
      panHandlerRef.current = null
      keyboardHandlerRef.current = null
    }
  }, [width, height, tenantConfig, model])

  return (
    <div 
      style={{ 
        position: 'relative',
        width: typeof width === 'string' ? width : `${width}px`,
        height: typeof height === 'string' ? height : `${height}px`
      }}
    >
      <GraphToolbar 
        graph={model.graph} 
        paper={model.paper}
        scale={model.scale}
        onScaleChange={(scale) => model.setScale(scale)}
        theme={tenantConfig.theme}
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
})