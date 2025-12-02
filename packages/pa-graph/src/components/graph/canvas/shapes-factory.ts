import { shapes } from '@joint/plus'
import { dnaPlatformTenant } from '../../../data'
import type { NodeData, EdgeData } from './types'

/**
 * Factory for creating JointJS node elements from node data
 */
export class ShapesFactory {
  private tenantConfig: typeof dnaPlatformTenant

  constructor(tenantConfig: typeof dnaPlatformTenant) {
    this.tenantConfig = tenantConfig
  }

  /**
   * Create a node element with tenant styling
   */
  createNode(node: NodeData): shapes.standard.Rectangle {
    const nodeStyle = this.tenantConfig.styles.nodes[node.type] || this.tenantConfig.styles.defaultNode
    
    console.log('Node:', node.label, 'Type:', node.type, 'Icon:', nodeStyle.icon, 'Full nodeStyle:', nodeStyle)

    return new shapes.standard.Rectangle({
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
          'xlink:href': nodeStyle.icon || 'https://api.iconify.design/mdi/cube-outline.svg?color=white',
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
