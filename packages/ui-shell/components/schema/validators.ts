/**
 * DNA Schema Validators
 * Utilities for validating field and component data against schema definitions
 */

import { ComponentDefinition, FieldDefinition } from './types'

export interface ValidationError {
  field: string
  errors: string[]
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Validates field data against field definition
 */
export function validateField(
  field: FieldDefinition,
  value: unknown
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required
  if (field.required && (value === null || value === undefined || value === '')) {
    errors.push(`${field.name} is required`)
    return { valid: false, errors }
  }

  // Skip further validation if not required and empty
  if (!field.required && (value === null || value === undefined || value === '')) {
    return { valid: true, errors: [] }
  }

  // Type validation
  switch (field.dataType) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push(`${field.name} must be a string`)
      }
      break
    case 'number':
      if (typeof value !== 'number') {
        errors.push(`${field.name} must be a number`)
      }
      break
    case 'integer':
      if (!Number.isInteger(value)) {
        errors.push(`${field.name} must be an integer`)
      }
      break
    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${field.name} must be a boolean`)
      }
      break
  }

  // Additional validation rules
  if (field.validation) {
    const val = field.validation

    if (val.format === 'email' && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        errors.push(`${field.name} must be a valid email`)
      }
    }

    if (typeof val.minimum === 'number' && typeof value === 'number') {
      if (value < val.minimum) {
        errors.push(`${field.name} must be at least ${val.minimum}`)
      }
    }

    if (typeof val.maximum === 'number' && typeof value === 'number') {
      if (value > val.maximum) {
        errors.push(`${field.name} must not exceed ${val.maximum}`)
      }
    }

    if (Array.isArray(val.enum)) {
      if (!val.enum.includes(value)) {
        errors.push(
          `${field.name} must be one of: ${val.enum.join(', ')}`
        )
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Validates component form data
 */
export function validateComponentData(
  component: ComponentDefinition,
  data: Record<string, unknown>
): ValidationResult {
  const errors: ValidationError[] = []

  component.fields.forEach((field) => {
    const fieldErrors = validateField(field, data[field.key])
    if (!fieldErrors.valid) {
      errors.push({
        field: field.key,
        errors: fieldErrors.errors,
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
