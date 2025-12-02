interface Resource {
  id: string
  type: string
  name: string
  metadata?: Record<string, unknown>
}

interface Relationship {
  id: string
  from: string
  to: string
  type: string
  metadata?: Record<string, unknown>
}

interface ResourceData {
  resources: Resource[]
  relationships: Relationship[]
}

interface Position {
  x: number
  y: number
}

interface TypeStyle {
  color: string
  shape: string
}

interface RelationshipStyle {
  color: string
  style: string
}

interface GraphLayout {
  layout: string
  nodeDefaults: {
    width: number
    height: number
  }
  typeStyles: Record<string, TypeStyle>
  relationshipStyles: Record<string, RelationshipStyle>
  positions: Record<string, Position>
}

interface GraphNode {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  color: string
}

interface GraphLink {
  id: string
  source: string
  target: string
  color: string
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

/**
 * Transforms pure resource data and layout config into graph visualization data
 */
export function transformToGraphData(
  resourceData: ResourceData,
  layout: GraphLayout
): GraphData {
  const nodes: GraphNode[] = resourceData.resources.map((resource) => {
    const position = layout.positions[resource.id] || { x: 0, y: 0 }
    const style = layout.typeStyles[resource.type] || { color: '#3b82f6' }
    
    return {
      id: resource.id,
      x: position.x,
      y: position.y,
      width: layout.nodeDefaults.width,
      height: layout.nodeDefaults.height,
      label: resource.name,
      color: style.color
    }
  })

  const links: GraphLink[] = resourceData.relationships.map((relationship) => {
    const style = layout.relationshipStyles[relationship.type] || { color: '#6b7280' }
    
    return {
      id: relationship.id,
      source: relationship.from,
      target: relationship.to,
      color: style.color
    }
  })

  return { nodes, links }
}

/**
 * Auto-layout resources using a simple algorithm (can be enhanced later)
 */
export function autoLayout(
  resourceData: ResourceData,
  options: { spacing?: number; startX?: number; startY?: number } = {}
): Record<string, Position> {
  const { spacing = 200, startX = 100, startY = 100 } = options
  const positions: Record<string, Position> = {}
  
  // Simple grid layout for now
  resourceData.resources.forEach((resource, index) => {
    const col = index % 3
    const row = Math.floor(index / 3)
    positions[resource.id] = {
      x: startX + col * spacing,
      y: startY + row * spacing
    }
  })
  
  return positions
}
