import { useState } from 'react'
import type { Resource } from '../data/example-resources'

interface LeftSidebarProps {
  width?: number
  resources?: Resource[]
  onResourceClick?: (resourceId: string) => void
}

export function LeftSidebar({ width = 280, resources = [], onResourceClick }: LeftSidebarProps) {
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)

  const handleResourceClick = (resourceId: string) => {
    setSelectedResourceId(resourceId)
    onResourceClick?.(resourceId)
  }

  return (
    <div
      style={{
        width,
        minWidth: width,
        height: '100%',
        backgroundColor: '#1e1e1e',
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#fff' }}>
          Structure
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {resources.map(resource => (
            <ResourceNode 
              key={resource.id} 
              resource={resource} 
              level={0} 
              onResourceClick={handleResourceClick}
              selectedResourceId={selectedResourceId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface ResourceNodeProps {
  resource: Resource
  level: number
  onResourceClick?: (resourceId: string) => void
  selectedResourceId: string | null
}

function ResourceNode({ resource, level, onResourceClick, selectedResourceId }: ResourceNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels
  const hasChildren = resource.children && resource.children.length > 0
  const isSelected = selectedResourceId === resource.id

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
            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            border: `1px solid ${isSelected ? '#3b82f6' : '#555'}`,
            borderRadius: '6px',
            color: isSelected ? '#fff' : '#ccc',
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
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
              e.currentTarget.style.color = '#fff'
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.borderColor = '#555'
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#ccc'
            }
          }}
        >
          <span>{resource.name}</span>
          {hasChildren && (
            <span 
              style={{ 
                color: '#666',
                fontSize: '14px',
                lineHeight: '1',
                fontWeight: '400',
                flexShrink: 0,
                cursor: 'pointer',
                padding: '2px 4px',
              }}
              onClick={handleToggle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#666'
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
            />
          ))}
        </div>
      )}
    </div>
  )
}