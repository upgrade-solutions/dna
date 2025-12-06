import { useState, useCallback, useRef, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { LayoutManager, type LayoutType } from '../features/layout/layout-manager'
import type { Theme } from '../../../types/theme'
import { getThemedColors } from '../../../types/theme'

// Simple SVG icons
const LayoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

export interface LayoutControlProps {
  layoutManager: LayoutManager | null
  theme: Theme
  onLayoutChange?: (type: LayoutType, requiresRebuild: boolean) => void
}

export const LayoutControl = observer(function LayoutControl({ layoutManager, theme, onLayoutChange }: LayoutControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showRebuildWarning, setShowRebuildWarning] = useState(false)
  const [pendingLayoutType, setPendingLayoutType] = useState<LayoutType | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
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

  const handleSelectLayout = useCallback((type: LayoutType) => {
    if (!layoutManager) return
    
    const currentLayout = layoutManager.getCurrentLayout()
    const needsRebuild = layoutManager.requiresRerender(currentLayout, type)
    
    if (needsRebuild) {
      // Show confirmation dialog for rebuild
      setPendingLayoutType(type)
      setShowRebuildWarning(true)
      setIsOpen(false)
    } else {
      // Apply layout directly (no rebuild needed)
      if (onLayoutChange) {
        onLayoutChange(type, false)
      } else {
        layoutManager.applyLayout(type)
      }
      setIsOpen(false)
    }
  }, [layoutManager, onLayoutChange])

  const handleConfirmRebuild = useCallback(() => {
    if (!pendingLayoutType || !layoutManager) return
    
    if (onLayoutChange) {
      onLayoutChange(pendingLayoutType, true)
    } else {
      // Fallback: just apply layout (won't rebuild, but at least tries)
      layoutManager.applyLayout(pendingLayoutType)
    }
    
    setShowRebuildWarning(false)
    setPendingLayoutType(null)
  }, [pendingLayoutType, layoutManager, onLayoutChange])

  const handleCancelRebuild = useCallback(() => {
    setShowRebuildWarning(false)
    setPendingLayoutType(null)
  }, [])

  if (!layoutManager) return null

  const currentLayout = layoutManager.getCurrentLayout()
  const availableLayouts = LayoutManager.getAvailableLayouts()

  const renderLayoutItem = (layout: { value: LayoutType; label: string; available: boolean; requiresRerender?: boolean }) => {
    const isSelected = layout.value === currentLayout
    const isDisabled = !layout.available
    const needsRerender = layoutManager.requiresRerender(currentLayout, layout.value)

    return (
      <div
        key={layout.value}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '8px 12px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s',
          background: isSelected ? themed.toolbar.buttonBackground : 'transparent',
          borderRadius: '4px',
          margin: '2px 0',
          opacity: isDisabled ? 0.4 : 1,
        }}
        onClick={() => !isDisabled && handleSelectLayout(layout.value)}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.background = themed.toolbar.buttonBackgroundHover
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isSelected ? themed.toolbar.buttonBackground : 'transparent'
        }}
        title={needsRerender ? 'Switching to this layout will rebuild the graph' : undefined}
      >
        <span style={{ 
          flex: 1, 
          fontSize: '13px',
          color: themed.toolbar.text,
        }}>
          {layout.label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {needsRerender && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#f59e0b',
              opacity: 0.8
            }}>
              <AlertIcon />
            </div>
          )}
          {isSelected && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: themed.toolbar.text
            }}>
              <CheckIcon />
            </div>
          )}
          {isDisabled && (
            <span style={{
              fontSize: '11px',
              color: themed.toolbar.textSecondary,
              fontStyle: 'italic'
            }}>
              Coming Soon
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          ref={buttonRef}
          onClick={handleToggleDropdown}
          disabled={!layoutManager}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            background: isOpen ? themed.toolbar.buttonBackgroundHover : themed.toolbar.buttonBackground,
            border: 'none',
            borderRadius: '4px',
            color: themed.toolbar.buttonText,
            cursor: layoutManager ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            fontSize: '12px',
            fontWeight: '500'
          }}
          onMouseEnter={(e) => {
            if (layoutManager && !isOpen) {
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
          title="Change Layout"
        >
          <LayoutIcon />
          <span>Layout</span>
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
              minWidth: '240px',
              maxWidth: '280px',
              background: themed.toolbar.background,
              border: `1px solid ${themed.toolbar.borderColor}`,
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 10000,
              padding: '8px 0 0 0'
            }}
          >
            {/* Header */}
            <div style={{ 
              padding: '8px 12px',
              borderBottom: `1px solid ${themed.toolbar.borderColor}`,
              marginBottom: '4px'
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: '600',
                color: themed.toolbar.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Layout Algorithm
              </div>
            </div>

            {/* Layout List */}
            <div style={{ padding: '4px 8px' }}>
              {availableLayouts.map(renderLayoutItem)}
            </div>
          </div>
        )}
      </div>

      {/* Rebuild Warning Dialog */}
      {showRebuildWarning && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001
          }}
          onClick={handleCancelRebuild}
        >
        <div
          style={{
            background: themed.toolbar.background,
            border: `1px solid ${themed.toolbar.borderColor}`,
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ color: '#f59e0b' }}>
              <AlertIcon />
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: themed.toolbar.text
            }}>
              Rebuild Graph Required
            </h3>
          </div>

          {/* Message */}
          <p style={{
            margin: '0 0 20px 0',
            fontSize: '14px',
            color: themed.toolbar.textSecondary,
            lineHeight: '1.5'
          }}>
            Switching to <strong>{pendingLayoutType === 'nested' ? 'Nested (Containers)' : 'Tree (Hierarchical)'}</strong> layout requires rebuilding the entire graph with different node types.
            {' '}This will reset the viewport and any manual node adjustments.
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCancelRebuild}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: `1px solid ${themed.toolbar.borderColor}`,
                borderRadius: '4px',
                color: themed.toolbar.text,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRebuild}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                border: 'none',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Rebuild Graph
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  )
})
