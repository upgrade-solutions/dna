import { shapes } from '@joint/plus'
import type { TenantConfig } from '../../../data/tenant-config'
import type { NodeData, EdgeData } from '../utils/types'
import { getIconForResourceType } from '../../../utils/icon-mapper'

/**
 * Factory for creating JointJS node elements from node data
 */
export class ShapesFactory {
  private tenantConfig: TenantConfig

  constructor(tenantConfig: TenantConfig) {
    this.tenantConfig = tenantConfig
  }

  /**
   * Create a node element with tenant styling
   */
  createNode(node: NodeData): shapes.standard.Rectangle {
    const nodeStyle = this.tenantConfig.styles.nodes[node.type] || this.tenantConfig.styles.defaultNode
    
    // Get resource type from metadata (e.g., 'web-application', 'api', 'database')
    const resourceType = (node.metadata?.resourceType as string) || 'other'
    const iconUrl = getIconForResourceType(resourceType)

    const element = new shapes.standard.Rectangle({
      id: node.id,
      position: node.position,
      size: { width: 160, height: 80 },
      markup: [{
        tagName: 'rect',
        selector: 'body'
      }, {
        tagName: 'image',
        selector: 'icon',
        attributes: {
          'preserveAspectRatio': 'xMidYMid'
        }
      }, {
        tagName: 'text',
        selector: 'label'
      }],
      attrs: {
        body: {
          fill: nodeStyle.fill,
          stroke: nodeStyle.stroke,
          strokeWidth: nodeStyle.strokeWidth || 1,
          rx: nodeStyle.rx || 8,
          ry: nodeStyle.ry || 8
        },
        icon: {
          'xlink:href': iconUrl,
          width: 24,
          height: 24,
          x: 68, // (160 - 24) / 2 = 68
          y: 35
        },
        label: {
          text: node.label,
          fill: '#ffffff',
          fontSize: 12,
          fontWeight: '600',
          // Position label at top like fieldset legend
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
      description: (node.metadata?.description as string) || undefined,
      type: undefined,
      priority: undefined,
      status: 'draft'
    })

    return element
  }

  /**
   * Create multiple node elements
   */
  createNodes(nodes: NodeData[]): shapes.standard.Rectangle[] {
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
