import { useState } from 'react'
import type { ResourceNodeProps } from './types'
import type { Theme } from '../../types/theme'
import { getThemedColors } from '../../types/theme'

export interface ResourceNodePropsWithTheme extends ResourceNodeProps {
  theme: Theme
}

export function ResourceNode({ 
  resource, 
  level, 
  onResourceClick, 
  selectedResourceId,
  theme
}: ResourceNodePropsWithTheme) {
  const [isExpanded, setIsExpanded] = useState(true) // Auto-expand all levels
  const hasChildren = resource.children && resource.children.length > 0
  const isSelected = selectedResourceId === resource.id
  const themed = getThemedColors(theme)

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering parent click
    setIsExpanded(!isExpanded)
  }

  const handleResourceClick = () => {
    onResourceClick?.(resource.id)
  }

  return (
    <div>
      <div
        style={{
          paddingLeft: `${level * 16}px`,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '4px',
        }}
      >
        <div
          style={{
            padding: '4px 10px',
            backgroundColor: isSelected ? themed.leftSidebar.itemBackgroundSelected : themed.leftSidebar.itemBackground,
            border: `1px solid ${isSelected ? themed.leftSidebar.itemBorderSelected : themed.leftSidebar.itemBorder}`,
            borderRadius: '6px',
            color: isSelected ? themed.leftSidebar.itemTextSelected : themed.leftSidebar.itemText,
            fontSize: '12px',
            fontWeight: '400',
            flex: 1,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            cursor: 'pointer',
          }}
          onClick={handleResourceClick}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.borderColor = themed.leftSidebar.itemBorderHover
              e.currentTarget.style.backgroundColor = themed.leftSidebar.itemBackgroundHover
              e.currentTarget.style.color = themed.leftSidebar.itemTextHover
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.borderColor = themed.leftSidebar.itemBorder
              e.currentTarget.style.backgroundColor = themed.leftSidebar.itemBackground
              e.currentTarget.style.color = themed.leftSidebar.itemText
            }
          }}
        >
          <span>{resource.name}</span>
          {hasChildren && (
            <span 
              style={{ 
                color: themed.leftSidebar.textSecondary,
                fontSize: '14px',
                lineHeight: '1',
                fontWeight: '400',
                flexShrink: 0,
                cursor: 'pointer',
                padding: '2px 4px',
              }}
              onClick={handleToggle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = themed.leftSidebar.text
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = themed.leftSidebar.textSecondary
              }}
            >
              {isExpanded ? '−' : '+'}
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {resource.children!.map(child => (
            <ResourceNode 
              key={child.id} 
              resource={child} 
              level={level + 1}
              onResourceClick={onResourceClick}
              selectedResourceId={selectedResourceId}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  )
}
