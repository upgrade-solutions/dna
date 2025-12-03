/**
 * Maps JointJS graph elements back to resource-based data
 * 
 * Nodes → Resources
 * Edges → Relationships
 */

import type { Resource, Relationship, ResourceGraph } from '../../data/example-resources'
import type { GraphNode, GraphEdge } from './resourceToGraph'

/**
 * Map visual node type back to resource type
 */
function mapNodeTypeToResourceType(nodeType: string): Resource['type'] {
  const typeMap: Record<string, Resource['type']> = {
    'web-application': 'web-application',
    'api': 'api',
    'database': 'database',
    'form': 'form-component',
    'service': 'service',
    'ui-component': 'ui-component'
  }
  return typeMap[nodeType] || 'service'
}

/**
 * Map edge label back to relationship type
 */
function mapEdgeLabelToRelationshipType(edgeType: string): Relationship['type'] {
  const typeMap: Record<string, Relationship['type']> = {
    'depends-on': 'depends-on',
    'contains': 'contains',
    'calls': 'communicates-with',
    'reads': 'reads-from',
    'writes': 'writes-to',
    'renders': 'renders'
  }
  return typeMap[edgeType] || 'depends-on'
}

/**
 * Convert graph nodes and edges back to resource-based data
 */
export function graphToResource(nodes: GraphNode[], edges: GraphEdge[]): ResourceGraph {
  const resources: Resource[] = nodes.map((node) => ({
    id: node.id,
    type: mapNodeTypeToResourceType(node.type),
    name: node.label,
    description: node.metadata?.description as string | undefined,
    metadata: node.metadata
  }))

  const relationships: Relationship[] = edges.map((edge) => ({
    id: edge.id,
    type: mapEdgeLabelToRelationshipType(edge.type),
    sourceId: edge.source,
    targetId: edge.target,
    metadata: edge.metadata
  }))

  return { resources, relationships }
}
