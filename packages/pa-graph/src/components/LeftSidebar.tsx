import { useState } from 'react'
import type { Resource } from '../data/example-resources'

interface LeftSidebarProps {
  width?: number
  resources?: Resource[]
}

export function LeftSidebar({ width = 280, resources = [] }: LeftSidebarProps) {
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
            <ResourceNode key={resource.id} resource={resource} level={0} />
          ))}
        </div>
      </div>
    </div>
  )
}

interface ResourceNodeProps {
  resource: Resource
  level: number
}

function ResourceNode({ resource, level }: ResourceNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels
  const hasChildren = resource.children && resource.children.length > 0

  return (
    <div>
      <div
        style={{
          paddingLeft: `${level * 16}px`,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: hasChildren ? 'pointer' : 'default',
          marginBottom: '4px',
        }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        <div
          style={{
            padding: '4px 10px',
            backgroundColor: 'transparent',
            border: '1px solid #555',
            borderRadius: '6px',
            color: '#ccc',
            fontSize: '12px',
            fontWeight: '400',
            flex: 1,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#888'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#555'
            e.currentTarget.style.color = '#ccc'
          }}
        >
          <span>{resource.name}</span>
          {hasChildren && (
            <span style={{ 
              color: '#666',
              fontSize: '14px',
              lineHeight: '1',
              fontWeight: '400',
              flexShrink: 0,
            }}>
              +
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {resource.children!.map(child => (
            <ResourceNode key={child.id} resource={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}