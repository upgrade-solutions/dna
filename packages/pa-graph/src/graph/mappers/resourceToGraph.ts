/**
 * Maps resource-based data to JointJS graph elements (nodes and edges)
 * 
 * Resources → Nodes (visual elements with position, styling)
 * Relationships → Edges (links between nodes)
 */

import type { Resource, Relationship, ResourceGraph } from '../../data/example-resources'

export interface GraphNode {
  id: string
  type: string
  label: string
  position: { x: number; y: number }
  metadata?: Record<string, unknown>
}

export interface GraphEdge {
  id: string
  type: string
  source: string
  target: string
  label?: string
  metadata?: Record<string, unknown>
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/**
 * Auto-layout algorithm - simple grid layout for now
 * TODO: Replace with dagre or force-directed layout
 */
function calculateNodePositions(resources: Resource[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()
  const gridColumns = 3
  const nodeSpacingX = 250
  const nodeSpacingY = 200
  const startX = 100
  const startY = 100

  resources.forEach((resource, index) => {
    const col = index % gridColumns
    const row = Math.floor(index / gridColumns)
    positions.set(resource.id, {
      x: startX + col * nodeSpacingX,
      y: startY + row * nodeSpacingY
    })
  })

  return positions
}

/**
 * Map resource type to visual node type
 */
function mapResourceTypeToNodeType(resourceType: Resource['type']): string {
  const typeMap: Record<Resource['type'], string> = {
    'web-application': 'web-application',
    'api': 'api',
    'database': 'database',
    'form-component': 'form',
    'service': 'service',
    'ui-component': 'ui-component'
  }
  return typeMap[resourceType] || 'default'
}

/**
 * Map relationship type to edge styling/label
 */
function mapRelationshipTypeToEdgeLabel(relType: Relationship['type']): string {
  const labelMap: Record<Relationship['type'], string> = {
    'depends-on': 'depends on',
    'contains': 'contains',
    'communicates-with': 'calls',
    'reads-from': 'reads',
    'writes-to': 'writes',
    'renders': 'renders'
  }
  return labelMap[relType] || relType
}

/**
 * Convert resource-based data to graph nodes and edges
 */
export function resourceToGraph(resourceGraph: ResourceGraph): GraphData {
  const positions = calculateNodePositions(resourceGraph.resources)

  const nodes: GraphNode[] = resourceGraph.resources.map((resource) => ({
    id: resource.id,
    type: mapResourceTypeToNodeType(resource.type),
    label: resource.name,
    position: positions.get(resource.id) || { x: 0, y: 0 },
    metadata: {
      description: resource.description,
      resourceType: resource.type,
      ...resource.metadata
    }
  }))

  const edges: GraphEdge[] = resourceGraph.relationships.map((relationship) => ({
    id: relationship.id,
    type: relationship.type,
    source: relationship.sourceId,
    target: relationship.targetId,
    label: mapRelationshipTypeToEdgeLabel(relationship.type),
    metadata: relationship.metadata
  }))

  return { nodes, edges }
}

/**
 * Validate that all relationships reference existing resources
 */
export function validateResourceGraph(resourceGraph: ResourceGraph): string[] {
  const errors: string[] = []
  const resourceIds = new Set(resourceGraph.resources.map(r => r.id))

  resourceGraph.relationships.forEach((rel) => {
    if (!resourceIds.has(rel.sourceId)) {
      errors.push(`Relationship ${rel.id}: source resource '${rel.sourceId}' not found`)
    }
    if (!resourceIds.has(rel.targetId)) {
      errors.push(`Relationship ${rel.id}: target resource '${rel.targetId}' not found`)
    }
  })

  return errors
}
