import { dia, shapes } from '@joint/plus'
import type { TenantConfig } from '../../../data/tenant-config'
import type { NodeData, EdgeData } from '../utils/types'
import type { LayoutMode } from '../features/layout/layout-manager'
import { getIconForResourceType } from '../../../utils/icon-mapper'
import { getThemedColors } from '../../../types/theme'
import { ResourceNode } from './ResourceNode'
import { ContainerNode } from './ContainerNode'

/**
 * Factory for creating JointJS node elements from node data
 */
export class ShapesFactory {
  private tenantConfig: TenantConfig
  private layoutMode: LayoutMode

  constructor(tenantConfig: TenantConfig, layoutMode: LayoutMode = 'tree') {
    this.tenantConfig = tenantConfig
    this.layoutMode = layoutMode
  }

  /**
   * Set layout mode (affects node type selection)
   */
  setLayoutMode(mode: LayoutMode): void {
    this.layoutMode = mode
  }

  /**
   * Create a node element with tenant styling
   */
  createNode(node: NodeData): dia.Element {
    const nodeStyle = this.tenantConfig.styles.nodes[node.type] || this.tenantConfig.styles.defaultNode
    const themed = getThemedColors(this.tenantConfig.theme)
    
    // Get resource type from metadata (e.g., 'web-application', 'api', 'database')
    const resourceType = (node.metadata?.resourceType as string) || 'other'
    
    // Determine if this should be a container node or resource node
    // In tree layout, all nodes are ResourceNodes (simpler, no containers)
    // In nested layout, ALL nodes become ContainerNodes (for consistent positioning)
    const useContainer = this.layoutMode === 'nested'
    
    if (useContainer) {
      // Create container node for resources with children
      
      const element = new ContainerNode({
        id: node.id,
        position: node.position,
        size: { width: 500, height: 250 },  // Larger initial size, will auto-fit to children
        expanded: true,
        attrs: {
          body: {
            fill: 'rgba(31, 41, 55, 0.15)',  // More transparent for better visibility
            stroke: nodeStyle.stroke || '#4b5563',
            strokeWidth: 2
          },
          header: {
            fill: nodeStyle.fill || '#374151',
            stroke: nodeStyle.stroke || '#4b5563'
          },
          label: {
            text: node.label,
            fill: '#ffffff',
            fontSize: 14,
            fontWeight: '700'
          },
          expandIcon: {
            stroke: '#9ca3af'
          }
        }
      })
      
      // Set DNA metadata
      element.set('dna', {
        resourceType: resourceType,
        language: (node.metadata?.language as string) || undefined,
        runtime: (node.metadata?.runtime as string) || undefined,
        infrastructure: (node.metadata?.infrastructure as string) || undefined,
        description: (node.metadata?.description as string) || undefined,
        // Process concerns
        status: (node.metadata?.status as string) || undefined,
        version: (node.metadata?.version as string) || undefined,
        lifecycle: (node.metadata?.lifecycle as string) || undefined,
        // People concerns
        owner: (node.metadata?.owner as string) || undefined,
        avatarUrl: (node.metadata?.avatarUrl as string) || undefined,
        team: (node.metadata?.team as string) || undefined,
        raci: (node.metadata?.raci as string) || undefined,
        // Security concerns
        dataClassification: (node.metadata?.dataClassification as string) || undefined,
        compliance: (node.metadata?.compliance as string[]) || undefined,
        riskLevel: (node.metadata?.riskLevel as string) || undefined,
        // Legacy fields
        type: undefined,
        priority: undefined
      })
      
      // Store hierarchy metadata
      element.set('hierarchyLevel', node.hierarchyLevel ?? 0)
      element.set('parentId', node.parentId)
      element.set('isContainer', true)
      
      return element
    } else {
      // Create regular resource node for leaf nodes
      const iconUrl = getIconForResourceType(resourceType)

      // Check if version is less than 1.0 for alpha/beta styling
      const version = (node.metadata?.version as string) || ''
      const isPreRelease = version && parseFloat(version) < 1.0
      
      const element = new ResourceNode({
        id: node.id,
        position: node.position,
        size: { width: 160, height: 80 },
        attrs: {
          body: {
            fill: themed.canvas.background,
            stroke: nodeStyle.stroke,
            strokeWidth: 2,
            strokeDasharray: isPreRelease ? '5,5' : undefined,
            rx: nodeStyle.rx || 8,
            ry: nodeStyle.ry || 8
          },
          icon: {
            'xlink:href': iconUrl,
            width: 24,
            height: 24,
            x: 68, // (160 - 24) / 2
            y: 35
          },
          label: {
            text: node.label,
            fill: '#ffffff',
            fontSize: 12,
            fontWeight: '600',
            y: 10,
            textAnchor: 'middle',
            textVerticalAnchor: 'top'
          }
        }
      })

      // Set DNA metadata properties - explicitly set undefined for optional fields
      // so Inspector knows they're unset rather than auto-selecting first option
      element.set('dna', {
        resourceType: resourceType,
        language: (node.metadata?.language as string) || undefined,
        runtime: (node.metadata?.runtime as string) || undefined,
        infrastructure: (node.metadata?.infrastructure as string) || undefined,
        description: (node.metadata?.description as string) || undefined,
        // Process concerns
        status: (node.metadata?.status as string) || undefined,
        version: (node.metadata?.version as string) || undefined,
        lifecycle: (node.metadata?.lifecycle as string) || undefined,
        // People concerns
        owner: (node.metadata?.owner as string) || undefined,
        avatarUrl: (node.metadata?.avatarUrl as string) || undefined,
        team: (node.metadata?.team as string) || undefined,
        raci: (node.metadata?.raci as string) || undefined,
        // Security concerns
        dataClassification: (node.metadata?.dataClassification as string) || undefined,
        compliance: (node.metadata?.compliance as string[]) || undefined,
        riskLevel: (node.metadata?.riskLevel as string) || undefined,
        // Legacy fields
        type: undefined,
        priority: undefined
      })
      
      // Store hierarchy metadata
      element.set('hierarchyLevel', node.hierarchyLevel ?? 0)
      element.set('parentId', node.parentId)
      element.set('isContainer', false)

      return element
    }
  }

  /**
   * Create multiple node elements
   */
  createNodes(nodes: NodeData[]): dia.Element[] {
    return nodes.map(node => this.createNode(node))
  }

  /**
   * Create a link element with tenant styling
   */
  createLink(edge: EdgeData): shapes.standard.Link {
    const linkStyle = (this.tenantConfig.styles.links as any)[edge.type] || this.tenantConfig.styles.defaultLink

    return new shapes.standard.Link({
      id: edge.id,
      source: { id: edge.source },
      target: { id: edge.target },
      labels: edge.label ? [{ 
        attrs: { 
          text: { 
            text: edge.label,
            fill: '#4b5563',
            fontSize: 11
          } 
        } 
      }] : [],
      attrs: {
        line: {
          stroke: linkStyle.stroke,
          strokeWidth: linkStyle.strokeWidth || 2,
          strokeDasharray: linkStyle.strokeDasharray,
          targetMarker: {
            type: 'path',
            d: 'M 10 -5 0 0 10 5 z',
            fill: linkStyle.stroke
          }
        }
      }
    })
  }

  /**
   * Create multiple link elements
   */
  createLinks(edges: EdgeData[]): shapes.standard.Link[] {
    return edges.map(edge => this.createLink(edge))
  }
}
