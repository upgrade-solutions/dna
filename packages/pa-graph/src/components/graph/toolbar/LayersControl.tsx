import { useState, useCallback, useRef, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import type { OverlayManager } from '../features/overlays/overlay-manager'
import type { CategoryId } from '../features/overlays/layer-types'
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

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const CheckboxCheckedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="currentColor"/>
    <polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2"/>
  </svg>
)

const CheckboxUncheckedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
  </svg>
)

const RadioSelectedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="5" fill="currentColor"/>
  </svg>
)

const RadioUnselectedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
  </svg>
)

export interface LayersControlProps {
  overlayManager: OverlayManager | null
  theme: Theme
}

export const LayersControl = observer(function LayersControl({ overlayManager, theme }: LayersControlProps) {
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

  const handleToggleCategory = useCallback((categoryId: CategoryId) => {
    if (!overlayManager) return
    overlayManager.toggleCategory(categoryId)
    forceUpdate({})
  }, [overlayManager])

  const handleSelectConcern = useCallback((categoryId: CategoryId, concernId: string) => {
    if (!overlayManager) return
    overlayManager.setActiveConcern(categoryId, concernId)
    forceUpdate({})
  }, [overlayManager])

  if (!overlayManager) return null

  const categories = overlayManager.getAllCategories()

  // Corner indicators (white arrows)
  const cornerIndicators: Record<string, string> = {
    'top-left': '⬉',
    'top-right': '⬈',
    'bottom-left': '⬋',
    'bottom-right': '⬊'
  }

  const renderCategory = (category: typeof categories[0]) => {
    const indicator = cornerIndicators[category.corner]
    
    return (
      <div
        key={category.id}
        style={{
          marginBottom: '12px',
          borderBottom: `1px solid ${themed.toolbar.borderColor}`,
          paddingBottom: '12px'
        }}
      >
        {/* Category Header with Enable/Disable Checkbox */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            cursor: 'pointer',
            background: category.enabled ? themed.toolbar.buttonBackgroundHover : 'transparent',
            borderRadius: '4px',
            marginBottom: '6px',
            transition: 'background 0.15s'
          }}
          onClick={() => handleToggleCategory(category.id)}
          onMouseEnter={(e) => {
            if (!category.enabled) {
              e.currentTarget.style.background = themed.toolbar.buttonBackground
            }
          }}
          onMouseLeave={(e) => {
            if (!category.enabled) {
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          <span style={{ fontSize: '16px', width: '20px', textAlign: 'center', color: 'white' }}>
            {indicator}
          </span>
          <span style={{
            flex: 1,
            fontSize: '13px',
            fontWeight: '600',
            color: themed.toolbar.text
          }}>
            {category.name}
          </span>
          <div style={{ color: category.enabled ? themed.toolbar.text : themed.toolbar.textSecondary }}>
            {category.enabled ? <CheckboxCheckedIcon /> : <CheckboxUncheckedIcon />}
          </div>
        </div>

        {/* Concerns List (shown when enabled or always visible) */}
        <div style={{
          paddingLeft: '36px',
          opacity: category.enabled ? 1 : 0.5,
          pointerEvents: category.enabled ? 'auto' : 'none'
        }}>
          {category.concerns.map(concern => {
            const isActive = category.activeConcern === concern.id
            const count = overlayManager.countCellsWithConcern(category.id, concern.id)
            
            return (
              <div
                key={concern.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  margin: '2px 0',
                  background: isActive ? themed.toolbar.buttonBackground : 'transparent',
                  transition: 'background 0.15s'
                }}
                onClick={() => handleSelectConcern(category.id, concern.id)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = themed.toolbar.buttonBackground
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <div style={{
                  color: isActive ? themed.toolbar.text : themed.toolbar.textSecondary,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {isActive ? <RadioSelectedIcon /> : <RadioUnselectedIcon />}
                </div>
                <span style={{
                  flex: 1,
                  fontSize: '12px',
                  color: isActive ? themed.toolbar.text : themed.toolbar.textSecondary
                }}>
                  {concern.name}
                </span>
                <span style={{
                  fontSize: '11px',
                  color: themed.toolbar.textSecondary,
                  fontWeight: '500',
                  minWidth: '20px',
                  textAlign: 'right'
                }}>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        ref={buttonRef}
        onClick={handleToggleDropdown}
        disabled={!overlayManager}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          background: isOpen ? themed.toolbar.buttonBackgroundHover : themed.toolbar.buttonBackground,
          border: 'none',
          borderRadius: '4px',
          color: themed.toolbar.buttonText,
          cursor: overlayManager ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          fontSize: '12px',
          fontWeight: '500'
        }}
        onMouseEnter={(e) => {
          if (overlayManager && !isOpen) {
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
            width: '280px',
            maxHeight: '600px',
            overflowY: 'auto',
            background: themed.toolbar.background,
            border: `1px solid ${themed.toolbar.borderColor}`,
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 10000,
            padding: '12px 0',
            // Themed scrollbar (matching inspector)
            scrollbarWidth: 'thin',
            scrollbarColor: '#444 #1a1a1a'
          }}
          className="layers-dropdown"
        >
          {/* Categories List */}
          <div style={{ padding: '0 4px' }}>
            {categories.map(renderCategory)}
          </div>
        </div>
      )}
    </div>
  )
})
