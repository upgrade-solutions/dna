import { useState, useCallback } from 'react'
import { dia } from '@joint/plus'
import { zoomIn, zoomOut, resetZoom, zoomToFit } from '../actions'
import type { Theme } from '../../../types/theme'
import { getThemedColors } from '../../../types/theme'

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
  theme: Theme
}

export function GraphToolbar({ graph, paper, scale: externalScale, onScaleChange, onAddNode, theme }: GraphToolbarProps) {
  const [internalScale, setInternalScale] = useState(1)
  const scale = externalScale ?? internalScale
  const themed = getThemedColors(theme)

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
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 10, 
        overflow: 'hidden',
        background: themed.toolbar.background,
        borderBottom: `1px solid ${themed.toolbar.borderColor}`,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}
    >
      <div 
        style={{ 
          display: 'flex',
          flexWrap: 'nowrap',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          overflowX: 'auto',
          overflowY: 'hidden',
          height: '44px'
        }}
      >
      {/* Zoom Controls */}
      <button
        onClick={handleZoomOut}
        disabled={!paper}
        style={{
          padding: '6px',
          background: themed.toolbar.buttonBackground,
          border: 'none',
          borderRadius: '4px',
          color: themed.toolbar.buttonText,
          cursor: paper ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          if (paper) {
            e.currentTarget.style.background = themed.toolbar.buttonBackgroundHover
            e.currentTarget.style.color = themed.toolbar.buttonTextHover
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = themed.toolbar.buttonBackground
          e.currentTarget.style.color = themed.toolbar.buttonText
        }}
        title="Zoom Out"
      >
        <ZoomOutIcon />
      </button>
      <button
        onClick={handleResetZoom}
        disabled={!paper}
        style={{
          padding: '4px 8px',
          background: themed.toolbar.buttonBackground,
          border: 'none',
          borderRadius: '4px',
          color: themed.toolbar.buttonText,
          cursor: paper ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          minWidth: '48px',
          flexShrink: 0,
          fontSize: '12px',
          fontWeight: '500'
        }}
        onMouseEnter={(e) => {
          if (paper) {
            e.currentTarget.style.background = themed.toolbar.buttonBackgroundHover
            e.currentTarget.style.color = themed.toolbar.buttonTextHover
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = themed.toolbar.buttonBackground
          e.currentTarget.style.color = themed.toolbar.buttonText
        }}
        title="Reset Zoom"
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        onClick={handleZoomIn}
        disabled={!paper}
        style={{
          padding: '6px',
          background: themed.toolbar.buttonBackground,
          border: 'none',
          borderRadius: '4px',
          color: themed.toolbar.buttonText,
          cursor: paper ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          if (paper) {
            e.currentTarget.style.background = themed.toolbar.buttonBackgroundHover
            e.currentTarget.style.color = themed.toolbar.buttonTextHover
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = themed.toolbar.buttonBackground
          e.currentTarget.style.color = themed.toolbar.buttonText
        }}
        title="Zoom In"
      >
        <ZoomInIcon />
      </button>

      <div style={{ width: '1px', height: '16px', background: themed.toolbar.divider, flexShrink: 0 }} />

      {/* Fit to Content */}
      <button
        onClick={handleFitToContent}
        disabled={!paper}
        style={{
          padding: '6px',
          background: themed.toolbar.buttonBackground,
          border: 'none',
          borderRadius: '4px',
          color: themed.toolbar.buttonText,
          cursor: paper ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          if (paper) {
            e.currentTarget.style.background = themed.toolbar.buttonBackgroundHover
            e.currentTarget.style.color = themed.toolbar.buttonTextHover
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = themed.toolbar.buttonBackground
          e.currentTarget.style.color = themed.toolbar.buttonText
        }}
        title="Fit to Content"
      >
        <FitToContentIcon />
      </button>

      {/* Add Node */}
      {onAddNode && (
        <>
          <div style={{ width: '1px', height: '16px', background: themed.toolbar.divider, flexShrink: 0 }} />
          <button
            onClick={onAddNode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              background: themed.toolbar.buttonPrimary,
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0,
              fontSize: '12px',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = themed.toolbar.buttonPrimaryHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = themed.toolbar.buttonPrimary
            }}
            title="Add Node"
          >
            <PlusIcon />
            <span>Add Node</span>
          </button>
        </>
      )}

      {/* Stats */}
      <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: '12px', fontSize: '12px', flexShrink: 0 }}>
        <span style={{ color: themed.toolbar.textSecondary, whiteSpace: 'nowrap' }}>Nodes: <span style={{ color: themed.toolbar.text, fontWeight: '500' }}>{graph?.getElements().length || 0}</span></span>
        <span style={{ color: themed.toolbar.textSecondary, whiteSpace: 'nowrap' }}>Links: <span style={{ color: themed.toolbar.text, fontWeight: '500' }}>{graph?.getLinks().length || 0}</span></span>
      </div>
      </div>
    </div>
  )
}
