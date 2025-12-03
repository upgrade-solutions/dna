/**
 * Resource and Relationship type definitions
 * Supports both flat and nested resource hierarchies
 */

export interface Resource {
  id: string
  type: string
  name: string
  description?: string
  metadata?: Record<string, any>
  children?: Resource[]  // Nested resources for hierarchical structures
}

export interface Relationship {
  id: string
  type: string
  sourceId: string
  targetId: string
  label?: string
  metadata?: Record<string, any>
}

export interface ResourceGraph {
  resources: Resource[]
  relationships: Relationship[]
}
