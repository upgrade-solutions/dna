import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { dia } from '@joint/plus'
import { dnaPlatformTenant } from '../../../data'
import { resourceToGraph } from '../../../graph/mappers'
import { initializeGraph, cleanupGraph } from './graph-init'
import { ShapesFactory } from './shapes-factory'
import { GraphEventHandler } from './event-handler'
import { populateGraph } from './utils'
import type { GraphCanvasProps } from './types'

/**
 * Ref handle to expose graph and paper instances
 */
export interface GraphCanvasRef {
  graph: dia.Graph | null
  paper: dia.Paper | null
  eventHandler: GraphEventHandler | null
}

/**
 * Enhanced GraphCanvas component that exposes graph/paper instances via ref
 * Useful when you need to add toolbars or other controls that interact with the graph
 */
export const GraphCanvasWithRef = forwardRef<GraphCanvasRef, GraphCanvasProps>(
  function GraphCanvasWithRef(
    { 
      width = '100%', 
      height = '100vh',
      tenantConfig = dnaPlatformTenant,
      onCellViewSelected
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null)
    const graphRef = useRef<dia.Graph | null>(null)
    const paperRef = useRef<dia.Paper | null>(null)
    const eventHandlerRef = useRef<GraphEventHandler | null>(null)

    // Expose graph and paper instances to parent
    useImperativeHandle(ref, () => ({
      graph: graphRef.current,
      paper: paperRef.current,
      eventHandler: eventHandlerRef.current
    }))

    useEffect(() => {
      if (!containerRef.current) return

      // Initialize graph and paper
      const { graph, paper } = initializeGraph({
        container: containerRef.current,
        width,
        height,
        tenantConfig
      })

      graphRef.current = graph
      paperRef.current = paper

      // Create shapes factory for cell creation
      const shapesFactory = new ShapesFactory(tenantConfig)

      // Load and populate graph with tenant data
      const graphData = resourceToGraph(tenantConfig.data)
      populateGraph(graph, graphData, shapesFactory)

      // Setup event handlers
      const eventHandler = new GraphEventHandler(paper, tenantConfig, onCellViewSelected)
      eventHandler.setupEvents()
      eventHandlerRef.current = eventHandler

      // Cleanup
      return () => {
        eventHandler.cleanup()
        cleanupGraph({ graph, paper })
        graphRef.current = null
        paperRef.current = null
        eventHandlerRef.current = null
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
)
