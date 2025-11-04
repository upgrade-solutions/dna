'use client'

import React from 'react'
import { FieldDefinition } from './types'
import { validateField } from './validators'

interface FieldRendererProps {
  field: FieldDefinition
  value?: unknown
  onChange?: (value: unknown) => void
  error?: string
  disabled?: boolean
}

/**
 * Dynamically renders a field based on its definition
 * Supports text, number, email, select, and other HTML5 input types
 */
export function FieldRenderer({
  field,
  value = '',
  onChange,
  error,
  disabled = false,
}: FieldRendererProps) {
  const validation = field.validation || {}
  const isEnum = Array.isArray(validation.enum)

  const baseInputClasses = `
    w-full px-5 py-4 border-2 rounded-xl text-base leading-relaxed
    border-gray-300 dark:border-gray-600 bg-background text-foreground
    placeholder-muted-foreground
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-4 focus:ring-primary/30 focus:border-primary
    transition-all duration-200
    ${error ? 'border-destructive focus:ring-destructive/30 focus:border-destructive' : ''}
  `

  return (
    <div className="space-y-3">
      <label htmlFor={field.id} className="block text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {field.name}
        {field.required && <span className="text-destructive ml-1.5">*</span>}
      </label>

      {/* Email input */}
      {field.dataType === 'string' && validation.format === 'email' && (
        <input
          id={field.id}
          type="email"
          value={String(value || '')}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={baseInputClasses}
          placeholder={`Enter ${field.name.toLowerCase()}`}
        />
      )}

      {/* Number input */}
      {field.dataType === 'number' && (
        <input
          id={field.id}
          type="number"
          value={Number(value || 0)}
          onChange={(e) => onChange?.(e.target.valueAsNumber)}
          disabled={disabled}
          className={baseInputClasses}
          min={typeof validation.minimum === 'number' ? validation.minimum : undefined}
          max={typeof validation.maximum === 'number' ? validation.maximum : undefined}
          placeholder={`Enter ${field.name.toLowerCase()}`}
        />
      )}

      {/* Integer input */}
      {field.dataType === 'integer' && (
        <input
          id={field.id}
          type="number"
          step="1"
          value={Number(value || 0)}
          onChange={(e) => onChange?.(e.target.valueAsNumber)}
          disabled={disabled}
          className={baseInputClasses}
          min={typeof validation.minimum === 'number' ? validation.minimum : undefined}
          max={typeof validation.maximum === 'number' ? validation.maximum : undefined}
          placeholder={`Enter ${field.name.toLowerCase()}`}
        />
      )}

      {/* Boolean input (checkbox) */}
      {field.dataType === 'boolean' && (
        <div className="flex items-center gap-4 pt-3">
          <input
            id={field.id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label htmlFor={field.id} className="text-base cursor-pointer font-normal">
            {field.name}
          </label>
        </div>
      )}

      {/* Select (enum) */}
      {isEnum && (
        <select
          id={field.id}
          value={String(value || '')}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={baseInputClasses}
        >
          <option value="">Select {field.name.toLowerCase()}</option>
          {(validation.enum as unknown[])?.map((option: unknown) => (
            <option key={String(option)} value={String(option)}>
              {String(option).replace(/-/g, ' ')}
            </option>
          ))}
        </select>
      )}

      {/* Text input (default) */}
      {field.dataType === 'string' &&
        validation.format !== 'email' &&
        !isEnum && (
          <input
            id={field.id}
            type="text"
            value={String(value || '')}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className={baseInputClasses}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        )}

      {/* Error message */}
      {error && <p className="text-sm font-semibold text-destructive mt-2 bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
    </div>
  )
}

interface FieldGroupRendererProps {
  fields: FieldDefinition[]
  data: Record<string, unknown>
  onChange?: (key: string, value: unknown) => void
  errors?: Record<string, string>
  disabled?: boolean
}

/**
 * Renders a group of fields
 */
export function FieldGroupRenderer({
  fields,
  data,
  onChange,
  errors = {},
  disabled = false,
}: FieldGroupRendererProps) {
  return (
    <div className="space-y-8">
      {fields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          value={data[field.key]}
          onChange={(value) => onChange?.(field.key, value)}
          error={errors[field.key]}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
