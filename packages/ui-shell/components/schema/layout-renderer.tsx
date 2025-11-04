'use client'

import React, { ReactNode } from 'react'
import { LayoutDefinition, ContainerDefinition } from './types'

interface LayoutRendererProps {
  layout: LayoutDefinition
  containers: Map<string, ReactNode>
  className?: string
}

/**
 * Renders a layout structure based on DNA schema
 * Supports grid and flexbox layouts
 */
export function LayoutRenderer({
  layout,
  containers,
  className = '',
}: LayoutRendererProps) {
  if (layout.structure === 'grid') {
    return (
      <div
        className={`grid gap-6 ${className}`}
        style={{
          gridTemplateColumns: `repeat(${layout.gridColumns || 12}, minmax(0, 1fr))`,
        }}
      >
        {layout.containers.map((container) => (
          <ContainerRenderer
            key={container.id}
            container={container}
            content={containers.get(container.id)}
          />
        ))}
      </div>
    )
  }

  if (layout.structure === 'flexbox') {
    return (
      <div className={`flex flex-col gap-6 ${className}`}>
        {layout.containers.map((container) => (
          <ContainerRenderer
            key={container.id}
            container={container}
            content={containers.get(container.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {layout.containers.map((container) => (
        <ContainerRenderer
          key={container.id}
          container={container}
          content={containers.get(container.id)}
        />
      ))}
    </div>
  )
}

interface ContainerRendererProps {
  container: ContainerDefinition
  content?: ReactNode
}

/**
 * Renders a container within a layout
 */
export function ContainerRenderer({ container, content }: ContainerRendererProps) {
  const gridColSpan = container.position.columnSpan
    ? `col-span-${container.position.columnSpan}`
    : 'col-span-12'

  const styles: React.CSSProperties = {}
  if (container.height) {
    styles.height = container.height
  }
  if (container.padding) {
    styles.padding = container.padding
  }

  return (
    <div
      className={`
        border border-border rounded-xl bg-card text-card-foreground
        shadow-sm hover:shadow-md
        ${gridColSpan}
        transition-all duration-200
      `}
      style={styles}
      data-container-id={container.id}
      data-container-key={container.key}
    >
      <div className="space-y-3">
        {content || (
          <div className="text-muted-foreground text-sm italic py-8 text-center">
            No content for {container.name}
          </div>
        )}
      </div>
    </div>
  )
}
