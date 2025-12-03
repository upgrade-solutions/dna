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
  hierarchyLevel?: number      // Depth in hierarchy (0=root level)
  hasChildren?: boolean         // Whether this node has children
  parentId?: string            // ID of parent node for embedding
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
 * Hierarchical layout algorithm - positions children within parent containers
 * Root nodes are arranged horizontally, children arranged vertically within parents
 */
function calculateNodePositions(
  resources: Array<Resource & { parentId?: string; hierarchyLevel: number }>
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()
  
  // Configuration
  const containerPadding = 20   // Padding inside containers
  const headerHeight = 20       // Space for container header
  const nodeSpacingY = 120      // Vertical spacing between siblings
  const rootSpacingX = 600      // Horizontal spacing between root nodes
  const childOffsetX = 0       // Indent children from left edge
  const startX = 100
  const startY = 100
  
  // Group resources by parent
  const byParent = new Map<string | undefined, typeof resources>()
  resources.forEach(resource => {
    const parentId = resource.parentId
    if (!byParent.has(parentId)) {
      byParent.set(parentId, [])
    }
    byParent.get(parentId)!.push(resource)
  })
  
  // Position root nodes (no parent) horizontally
  const rootNodes = byParent.get(undefined) || []
  rootNodes.forEach((root, index) => {
    positions.set(root.id, {
      x: startX + index * rootSpacingX,
      y: startY
    })
  })
  
  // Recursively position children within their parent containers
  function positionChildren(parentId: string) {
    const children = byParent.get(parentId) || []
    if (children.length === 0) return
    
    const parentPos = positions.get(parentId)
    if (!parentPos) return
    
    // Position children in a vertical stack within parent
    children.forEach((child, index) => {
      positions.set(child.id, {
        x: parentPos.x + containerPadding + childOffsetX,
        y: parentPos.y + headerHeight + containerPadding + (index * nodeSpacingY)
      })
      
      // Recursively position this child's children
      positionChildren(child.id)
    })
  }
  
  // Position all children starting from roots
  rootNodes.forEach(root => positionChildren(root.id))
  
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
 * Flatten nested resource hierarchy into a flat list with parent tracking
 */
function flattenResources(
  resources: Resource[], 
  parentId?: string, 
  level: number = 0
): Array<Resource & { parentId?: string; hierarchyLevel: number }> {
  const result: Array<Resource & { parentId?: string; hierarchyLevel: number }> = []
  
  for (const resource of resources) {
    const { children, ...resourceData } = resource
    
    // Add current resource with hierarchy metadata
    result.push({
      ...resourceData,
      parentId,
      hierarchyLevel: level,
      children // Keep children for hasChildren check
    })
    
    // Recursively process children
    if (children && children.length > 0) {
      const childResources = flattenResources(children, resource.id, level + 1)
      result.push(...childResources)
    }
  }
  
  return result
}

/**
 * Convert resource-based data to graph nodes and edges
 */
export function resourceToGraph(resourceGraph: ResourceGraph): GraphData {
  // Flatten nested hierarchy into a list with parent tracking
  const flatResources = flattenResources(resourceGraph.resources)
  
  // Calculate positions for all flattened resources
  const positions = calculateNodePositions(flatResources)

  const nodes: GraphNode[] = flatResources.map((resource) => ({
    id: resource.id,
    type: mapResourceTypeToNodeType(resource.type),
    label: resource.name,
    position: positions.get(resource.id) || { x: 0, y: 0 },
    hierarchyLevel: resource.hierarchyLevel,
    hasChildren: (resource.children?.length ?? 0) > 0,
    parentId: resource.parentId,
    metadata: {
      description: resource.description,
      resourceType: resource.type,
      ...resource.metadata
    }
  }))

  // Create edges from explicit relationships only
  // Note: Parent-child relationships are shown via embedding, not links
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
