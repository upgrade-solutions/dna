import { useState, useCallback } from 'react'
import { dia } from '@joint/plus'
import { zoomIn, zoomOut, resetZoom, zoomToFit } from '../actions'

// Simple SVG icons
const ZoomInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
    <line x1="11" y1="8" x2="11" y2="14"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
)

const ZoomOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
)

const FitToContentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 8V5a2 2 0 0 1 2-2h3"/>
    <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
    <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
    <path d="M21 16v3a2 2 0 0 1-2 2h-3"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

/**
 * Example toolbar component for graph canvas
 * Demonstrates how to use the modular graph-canvas utilities
 */
export interface GraphToolbarProps {
  graph: dia.Graph | null
  paper: dia.Paper | null
  scale?: number
  onScaleChange?: (scale: number) => void
  onAddNode?: () => void
}

export function GraphToolbar({ graph, paper, scale: externalScale, onScaleChange, onAddNode }: GraphToolbarProps) {
  const [internalScale, setInternalScale] = useState(1)
  const scale = externalScale ?? internalScale

  const handleZoomIn = useCallback(() => {
    if (!paper) return
    const newScale = zoomIn(paper)
    setInternalScale(newScale)
    onScaleChange?.(newScale)
  }, [paper, onScaleChange])

  const handleZoomOut = useCallback(() => {
    if (!paper) return
    const newScale = zoomOut(paper)
    setInternalScale(newScale)
    onScaleChange?.(newScale)
  }, [paper, onScaleChange])

  const handleFitToContent = useCallback(() => {
    if (!paper) return
    const newScale = zoomToFit(paper)
    setInternalScale(newScale)
    onScaleChange?.(newScale)
  }, [paper, onScaleChange])

  const handleResetZoom = useCallback(() => {
    if (!paper) return
    const newScale = resetZoom(paper)
    setInternalScale(newScale)
    onScaleChange?.(newScale)
  }, [paper, onScaleChange])

  return (
    <div 
      className="bg-blue-950 border-b border-gray-700/50 shadow-lg"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, overflow: 'hidden' }}
    >
      <div 
        className="flex flex-nowrap items-center gap-2 px-3 py-2 overflow-x-auto overflow-y-hidden"
        style={{ height: '44px' }}
      >
      {/* Zoom Controls */}
      <button
        onClick={handleZoomOut}
        className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-all flex-shrink-0"
        title="Zoom Out"
        disabled={!paper}
      >
        <ZoomOutIcon />
      </button>
      <button
        onClick={handleResetZoom}
        className="px-2 py-1 hover:bg-gray-800 rounded text-xs font-medium text-gray-400 hover:text-white transition-all min-w-[48px] flex-shrink-0"
        title="Reset Zoom"
        disabled={!paper}
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        onClick={handleZoomIn}
        className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-all flex-shrink-0"
        title="Zoom In"
        disabled={!paper}
      >
        <ZoomInIcon />
      </button>

      <div className="w-px h-4 bg-gray-700 flex-shrink-0" />

      {/* Fit to Content */}
      <button
        onClick={handleFitToContent}
        className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-all flex-shrink-0"
        title="Fit to Content"
        disabled={!paper}
      >
        <FitToContentIcon />
      </button>

      {/* Add Node */}
      {onAddNode && (
        <>
          <div className="w-px h-4 bg-gray-700 flex-shrink-0" />
          <button
            onClick={onAddNode}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/90 hover:bg-blue-600 rounded text-xs font-medium text-white transition-all flex-shrink-0"
            title="Add Node"
          >
            <PlusIcon />
            <span>Add Node</span>
          </button>
        </>
      )}

      {/* Stats */}
      <div className="ml-auto flex flex-nowrap items-center gap-3 text-xs flex-shrink-0">
        <span className="text-gray-500 whitespace-nowrap">Nodes: <span className="text-gray-300 font-medium">{graph?.getElements().length || 0}</span></span>
        <span className="text-gray-500 whitespace-nowrap">Links: <span className="text-gray-300 font-medium">{graph?.getLinks().length || 0}</span></span>
      </div>
      </div>
    </div>
  )
}
