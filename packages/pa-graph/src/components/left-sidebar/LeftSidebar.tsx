import { useState } from 'react'
import { ResourceNode } from './ResourceNode'
import type { LeftSidebarProps } from './types'
import type { Theme } from '../../types/theme'
import { getThemedColors } from '../../types/theme'

export interface LeftSidebarPropsWithTheme extends LeftSidebarProps {
  theme: Theme
}

export function LeftSidebar({ 
  width = 280, 
  resources = [], 
  onResourceClick,
  theme
}: LeftSidebarPropsWithTheme) {
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)
  const themed = getThemedColors(theme)

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
        backgroundColor: themed.leftSidebar.background,
        borderRight: `1px solid ${themed.leftSidebar.borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: themed.leftSidebar.text }}>
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
              theme={theme}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
