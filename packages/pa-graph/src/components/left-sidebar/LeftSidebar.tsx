import { useState } from 'react'
import { ResourceNode } from './ResourceNode'
import type { LeftSidebarProps } from './types'

export function LeftSidebar({ 
  width = 280, 
  resources = [], 
  onResourceClick 
}: LeftSidebarProps) {
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
