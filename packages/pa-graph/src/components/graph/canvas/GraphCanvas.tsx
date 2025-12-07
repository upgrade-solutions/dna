import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { dia } from '@joint/plus'
import { observer } from 'mobx-react-lite'
import { dnaPlatformTenant } from '../../../data'
import { resourceToGraph } from '../../../graph/mappers'
import { initializeGraph, cleanupGraph, populateGraph } from '../utils'
import { ShapesFactory } from '../shapes'
import '../shapes/ResourceNode' // Register custom shape
import '../shapes/ContainerNode' // Register container shape
import { GraphEventHandler, ZoomHandler, PanHandler, KeyboardHandler } from '../features/interaction'
import { OverlayManager } from '../features/overlays'
import { LayoutManager, HierarchyVisibilityManager } from '../features/layout'
import { GraphToolbar } from '../toolbar/GraphToolbar'
import { GraphModel } from '../../../models'
import { getThemedColors } from '../../../types/theme'
import type { GraphCanvasProps } from '../utils/types'
import type { LayoutType } from '../features/layout/types'
import { BadgeTooltip } from './BadgeTooltip'

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
  const overlayManagerRef = useRef<OverlayManager | null>(null)
  const layoutManagerRef = useRef<LayoutManager | null>(null)
  
  // Tooltip state
  const [tooltipContent, setTooltipContent] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)

  // Memoize tenantConfig to prevent unnecessary rerenders when only theme changes
  // Only reinitialize graph when data or styles actually change
  const stableConfig = useMemo(() => tenantConfig, [
    tenantConfig.id,
    tenantConfig.data,
    tenantConfig.styles,
    tenantConfig.settings
  ])

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize graph and paper
    const { graph, paper } = initializeGraph({
      container: containerRef.current,
      width,
      height,
      tenantConfig: stableConfig
    })

    // Store in MobX model
    model.setGraph(graph)
    model.setPaper(paper)

    // Create and initialize overlay manager
    const overlayManager = new OverlayManager(graph, paper)
    overlayManagerRef.current = overlayManager
    model.setOverlayManager(overlayManager)

    // Create and initialize layout manager
    const layoutManager = new LayoutManager(graph, 'tree', 'tree')
    layoutManagerRef.current = layoutManager
    model.setLayoutManager(layoutManager)

    // Create shapes factory for cell creation (use 'tree' mode for ResourceNodes)
    const shapesFactory = new ShapesFactory(stableConfig, 'tree')

    // Load and populate graph with tenant data
    const graphData = resourceToGraph(stableConfig.data)
    populateGraph(graph, graphData, shapesFactory, 'tree') // Use 'tree' mode for traditional tree layout

    // Apply default tree layout after populating graph
    layoutManager.applyLayout()

    // Setup hierarchy visibility manager
    // Note: Disable for tree layout - we want all nodes visible in tree mode
    // Only enable for nested/container layouts where progressive disclosure makes sense
    const hierarchyVisibilityManager = new HierarchyVisibilityManager({
      graph,
      paper,
      enabled: false // Disabled for tree layout - show all nodes
    })
    model.setHierarchyVisibilityManager(hierarchyVisibilityManager)
    
    // Don't initialize visibility - all nodes should be visible in tree layout
    // hierarchyVisibilityManager.updateVisibility(1.0)

    // Note: We don't assign cells to layers anymore. 
    // Layers now control badge visibility (language/runtime badges on nodes)
    // All resource nodes are always visible - layers are visual decorations only

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
      stableConfig, 
      (cellView) => model.setSelectedCellView(cellView),
      zoomHandler,
      hierarchyVisibilityManager
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

    // Badge tooltip handlers
    const handleMouseMove = (evt: MouseEvent) => {
      const target = evt.target as SVGElement
      
      // Check if hovering over a badge element (circle, image, or text)
      const selector = target.getAttribute('joint-selector')
      
      if (selector && (
        selector.includes('BadgeCircle') || 
        selector.includes('BadgeText') ||
        (selector.includes('Badge') && !selector.includes('Circle') && !selector.includes('Text'))
      )) {
        const tooltipAttr = target.getAttribute('data-tooltip')
        if (tooltipAttr) {
          setTooltipContent(tooltipAttr)
          setTooltipPosition({ x: evt.clientX, y: evt.clientY })
          return
        }
      }
      
      // Clear tooltip if not over a badge
      setTooltipContent(null)
      setTooltipPosition(null)
    }

    const handleMouseLeave = () => {
      setTooltipContent(null)
      setTooltipPosition(null)
    }

    containerRef.current.addEventListener('mousemove', handleMouseMove)
    containerRef.current.addEventListener('mouseleave', handleMouseLeave)

    // Cleanup
    return () => {
      containerRef.current?.removeEventListener('wheel', handleWheel)
      containerRef.current?.removeEventListener('mousemove', handleMouseMove)
      containerRef.current?.removeEventListener('mouseleave', handleMouseLeave)
      paper.off('blank:pointerdown', handleBlankPointerDown)
      keyboardHandler.cleanup()
      panHandler.cleanup()
      eventHandler.cleanup()
      overlayManager.cleanup()
      layoutManager.cleanup()
      hierarchyVisibilityManager.cleanup()
      cleanupGraph({ graph, paper })
      model.cleanup()
      eventHandlerRef.current = null
      panHandlerRef.current = null
      keyboardHandlerRef.current = null
      overlayManagerRef.current = null
      layoutManagerRef.current = null
    }
  }, [width, height, stableConfig, model])

  // Separate effect to update theme-related styles without reinitializing graph
  useEffect(() => {
    if (!model.paper) return

    const themed = getThemedColors(tenantConfig.theme)
    
    // Update paper background color when theme changes
    model.paper.drawBackground({
      color: themed.canvas.background
    })
  }, [tenantConfig.theme, model])

  // Handle layout changes that require graph rebuild
  const handleLayoutChange = useCallback(async (layoutType: LayoutType, requiresRebuild: boolean) => {
    if (!requiresRebuild) {
      // Simple layout change without rebuild - already handled by LayoutManager
      return
    }

    // For nested layout or switching from nested, need to rebuild graph with proper cell types
    // For nested layout, only include nodes down to page level (L0-L2), excluding sections (L3) and blocks (L4)
    const maxDepth = layoutType === 'nested' ? 2 : undefined
    const graphData = resourceToGraph(stableConfig.data, maxDepth)
    const layoutMode = layoutType === 'nested' ? 'nested' : 'tree'
    const shapesFactory = new ShapesFactory(stableConfig, layoutMode)
    
    await model.rebuildWithLayout(layoutType, graphData, shapesFactory, populateGraph)
  }, [stableConfig, model])

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
        overlayManager={model.overlayManager}
        layoutManager={model.layoutManager}
        scale={model.scale}
        onScaleChange={(scale) => model.setScale(scale)}
        onLayoutChange={handleLayoutChange}
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
      <BadgeTooltip content={tooltipContent} position={tooltipPosition} />
    </div>
  )
})