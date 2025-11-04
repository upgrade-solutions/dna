'use client'

import React, { useState } from 'react'
import { PageDefinition, UISchema, ComponentDefinition } from './types'
import { LayoutRenderer } from './layout-renderer'
import { ComponentRenderer } from './component-renderer'
import { resolveComponent, getPageComponents } from './resolvers'

interface PageRendererProps {
  schema: UISchema
  page: PageDefinition
  onComponentSubmit?: (componentId: string, data: Record<string, unknown>) => void
  disabled?: boolean
}

/**
 * Renders a complete page based on schema definition
 * Combines layout and components
 */
export function PageRenderer({
  schema,
  page,
  onComponentSubmit,
  disabled = false,
}: PageRendererProps) {
  const [componentData, setComponentData] = useState<
    Record<string, Record<string, unknown>>
  >({})

  // Get components used on this page
  const pageComponents = getPageComponents(schema, page)
  const componentMap = new Map<string, ComponentDefinition>()
  pageComponents.forEach((comp) => componentMap.set(comp.id, comp))

  // Build container content map
  const containerContent = new Map<string, React.ReactNode>()

  page.layout.containers.forEach((container) => {
    const componentNodes = container.components
      .sort((a, b) => a.order - b.order)
      .map((ref) => {
        const component = componentMap.get(ref.componentId)
        if (!component) return null

        return (
          <ComponentRenderer
            key={ref.componentId}
            component={component}
            data={componentData[ref.componentId] || {}}
            onChange={(data) => {
              setComponentData((prev) => ({
                ...prev,
                [ref.componentId]: data,
              }))
            }}
            onSubmit={(data) => {
              setComponentData((prev) => ({
                ...prev,
                [ref.componentId]: data,
              }))
              onComponentSubmit?.(ref.componentId, data)
            }}
            disabled={disabled}
          />
        )
      })
      .filter(Boolean)

      if (componentNodes.length > 0) {
      containerContent.set(container.id, (
        <div className="space-y-6">{componentNodes}</div>
      ))
    }
  })

  return (
    <div
      className="space-y-8"
      data-page-id={page.id}
      data-page-key={page.key}
    >
      {page.description && (
        <div className="space-y-3 pb-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{page.name}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">{page.description}</p>
        </div>
      )}

      {page.resourceName && (
        <div className="inline-block px-4 py-2 rounded-lg bg-muted border border-border">
          <span className="text-sm font-medium text-foreground">Resource:</span>
          <span className="text-sm text-muted-foreground ml-2">{page.resourceName}</span>
        </div>
      )}

      <LayoutRenderer
        layout={page.layout}
        containers={containerContent}
      />

      {page.actions && page.actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          {page.actions.map((action) => (
            <button
              key={action.id}
              className={`
                px-6 py-3 rounded-lg text-base font-semibold
                bg-secondary text-secondary-foreground
                hover:bg-secondary/80 active:bg-secondary/70
                transition-all duration-200
              `}
            >
              {action.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
