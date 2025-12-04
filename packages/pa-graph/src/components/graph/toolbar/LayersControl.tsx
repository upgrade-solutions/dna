import { useState, useCallback, useRef, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import type { LayerManager, LayerConfig } from '../features/layer-manager'
import type { Theme } from '../../../types/theme'
import { getThemedColors } from '../../../types/theme'

// Simple SVG icons
const LayersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

export interface LayersControlProps {
  layerManager: LayerManager | null
  theme: Theme
}

export const LayersControl = observer(function LayersControl({ layerManager, theme }: LayersControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [, forceUpdate] = useState({})
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const themed = getThemedColors(theme)

  // Update dropdown position when opening
  const handleToggleDropdown = useCallback(() => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left
      })
    }
    setIsOpen(!isOpen)
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggleLayer = useCallback((layerId: string) => {
    if (!layerManager) return
    layerManager.toggleLayerVisibility(layerId)
    forceUpdate({}) // Force re-render
  }, [layerManager])

  const handleShowAll = useCallback(() => {
    if (!layerManager) return
    layerManager.showAllLayers()
    forceUpdate({}) // Force re-render
  }, [layerManager])

  const handleHideAll = useCallback(() => {
    if (!layerManager) return
    layerManager.hideAllLayers()
    forceUpdate({}) // Force re-render
  }, [layerManager])

  if (!layerManager) return null

  const allLayers = layerManager.getAllLayers()

  const renderLayerItem = (layer: LayerConfig) => {
    // For language/runtime layers, count all cells with that property set
    const count = layerManager.countCellsWithProperty(layer.category)

    return (
      <div
        key={layer.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          cursor: 'pointer',
          transition: 'background 0.15s',
          background: layer.visible ? 'transparent' : themed.toolbar.buttonBackground,
          borderRadius: '4px',
          margin: '2px 0',
          opacity: count === 0 ? 0.5 : 1
        }}
        onClick={() => handleToggleLayer(layer.id)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = themed.toolbar.buttonBackgroundHover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = layer.visible ? 'transparent' : themed.toolbar.buttonBackground
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '20px',
          color: layer.visible ? themed.toolbar.text : themed.toolbar.textSecondary
        }}>
          {layer.visible ? <EyeIcon /> : <EyeOffIcon />}
        </div>
        <span style={{ 
          flex: 1, 
          fontSize: '13px',
          color: layer.visible ? themed.toolbar.text : themed.toolbar.textSecondary,
          opacity: layer.visible ? 1 : 0.6
        }}>
          {layer.name}
        </span>
        <span style={{ 
          fontSize: '12px',
          color: themed.toolbar.textSecondary,
          fontWeight: '500',
          minWidth: '24px',
          textAlign: 'right'
        }}>
          {count}
        </span>
      </div>
    )
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        ref={buttonRef}
        onClick={handleToggleDropdown}
        disabled={!layerManager}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          background: isOpen ? themed.toolbar.buttonBackgroundHover : themed.toolbar.buttonBackground,
          border: 'none',
          borderRadius: '4px',
          color: themed.toolbar.buttonText,
          cursor: layerManager ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          fontSize: '12px',
          fontWeight: '500'
        }}
        onMouseEnter={(e) => {
          if (layerManager && !isOpen) {
            e.currentTarget.style.background = themed.toolbar.buttonBackgroundHover
            e.currentTarget.style.color = themed.toolbar.buttonTextHover
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = themed.toolbar.buttonBackground
            e.currentTarget.style.color = themed.toolbar.buttonText
          }
        }}
        title="Toggle Layers"
      >
        <LayersIcon />
        <span>Layers</span>
        <div style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          <ChevronDownIcon />
        </div>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            minWidth: '280px',
            maxWidth: '320px',
            maxHeight: '500px',
            overflowY: 'auto',
            background: themed.toolbar.background,
            border: `1px solid ${themed.toolbar.borderColor}`,
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 10000,
            padding: '8px 0 0 0'
          }}
        >
          {/* Quick Actions */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            padding: '8px 12px',
            borderBottom: `1px solid ${themed.toolbar.borderColor}`,
            marginBottom: '8px'
          }}>
            <button
              onClick={handleShowAll}
              style={{
                flex: 1,
                padding: '6px',
                background: themed.toolbar.buttonBackground,
                border: 'none',
                borderRadius: '4px',
                color: themed.toolbar.buttonText,
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = themed.toolbar.buttonBackgroundHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = themed.toolbar.buttonBackground
              }}
            >
              Show All
            </button>
            <button
              onClick={handleHideAll}
              style={{
                flex: 1,
                padding: '6px',
                background: themed.toolbar.buttonBackground,
                border: 'none',
                borderRadius: '4px',
                color: themed.toolbar.buttonText,
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = themed.toolbar.buttonBackgroundHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = themed.toolbar.buttonBackground
              }}
            >
              Hide All
            </button>
          </div>
          {/* Layer List */}
          <div style={{ padding: '4px 0' }}>
            {allLayers.map(renderLayerItem)}
          </div>
        </div>
      )}
    </div>
  )
})

