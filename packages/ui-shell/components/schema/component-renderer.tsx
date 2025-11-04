'use client'

import React, { useState } from 'react'
import { ComponentDefinition } from './types'
import { validateComponentData } from './validators'
import { FieldGroupRenderer } from './field-renderer'

interface ComponentRendererProps {
  component: ComponentDefinition
  data?: Record<string, unknown>
  onSubmit?: (data: Record<string, unknown>) => void
  onChange?: (data: Record<string, unknown>) => void
  disabled?: boolean
}

/**
 * Renders a component based on its definition
 * Includes form handling and validation
 */
export function ComponentRenderer({
  component,
  data = {},
  onSubmit,
  onChange,
  disabled = false,
}: ComponentRendererProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(data)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFieldChange = (key: string, value: unknown) => {
    const newData = { ...formData, [key]: value }
    setFormData(newData)
    onChange?.(newData)
    // Clear error for this field on change
    if (errors[key]) {
      setErrors({ ...errors, [key]: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate
      const validation = validateComponentData(component, formData)
      if (!validation.valid) {
        const errorMap: Record<string, string> = {}
        validation.errors.forEach((err) => {
          errorMap[err.field] = err.errors[0]
        })
        setErrors(errorMap)
        setIsSubmitting(false)
        return
      }

      // Clear errors and submit
      setErrors({})
      onSubmit?.(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasSubmitHandler = component.handlers?.some(
    (h) => h.key === 'onSubmit'
  )

  return (
    <div
      className="space-y-8 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-8 bg-gray-50 dark:bg-gray-950/30"
      data-component-id={component.id}
      data-component-key={component.key}
    >
      {component.description && (
        <p className="text-base text-muted-foreground leading-relaxed">{component.description}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <FieldGroupRenderer
          fields={component.fields}
          data={formData}
          onChange={handleFieldChange}
          errors={errors}
          disabled={disabled || isSubmitting}
        />

        {hasSubmitHandler && (
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="submit"
              disabled={disabled || isSubmitting}
              className={`
                px-8 py-4 rounded-lg text-base font-bold
                bg-primary text-primary-foreground
                hover:bg-primary/90 active:bg-primary/80
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                min-w-[140px]
              `}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

interface MultiComponentRendererProps {
  components: ComponentDefinition[]
  data?: Record<string, Record<string, unknown>>
  onComponentSubmit?: (componentId: string, data: Record<string, unknown>) => void
  disabled?: boolean
}

/**
 * Renders multiple components
 */
export function MultiComponentRenderer({
  components,
  data = {},
  onComponentSubmit,
  disabled = false,
}: MultiComponentRendererProps) {
  const [componentData, setComponentData] = useState(data)

  const handleComponentChange = (componentId: string, newData: Record<string, unknown>) => {
    setComponentData((prev) => ({
      ...prev,
      [componentId]: newData,
    }))
  }

  const handleComponentSubmit = (componentId: string, formData: Record<string, unknown>) => {
    handleComponentChange(componentId, formData)
    onComponentSubmit?.(componentId, formData)
  }

  return (
    <div className="space-y-8">
      {components.map((component) => (
        <ComponentRenderer
          key={component.id}
          component={component}
          data={componentData[component.id] || {}}
          onChange={(newData) => handleComponentChange(component.id, newData)}
          onSubmit={(formData) => handleComponentSubmit(component.id, formData)}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
