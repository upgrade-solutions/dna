/**
 * Container Factory - Builds nested container hierarchies from account resources
 * 
 * This factory creates JointJS container nodes with proper embedding for the nested layout.
 * It handles the 6-level hierarchy:
 * - L0: Account (root container)
 * - L1: Application (apps within account)
 * - L2: Module (modules within app)
 * - L3: Page (pages within module)
 * - L4: Section (sections within page)
 * - L5: Block (leaf nodes - no container, just ResourceNode)
 */

import { dia } from '@joint/plus'
import type { Resource } from '../../../../data/example-resources'
import type { TenantConfig } from '../../../../data/tenant-config'
import { ContainerNode } from '../../shapes/ContainerNode'
import { ResourceNode } from '../../shapes/ResourceNode'
import { getIconForResourceType } from '../../../../utils/icon-mapper'
import type { NestedLayoutOptions } from './layout-manager'

/**
 * Configuration for container factory
 */
export interface ContainerFactoryConfig {
  tenantConfig: TenantConfig
  layoutOptions: NestedLayoutOptions
}

/**
 * Factory for creating nested container hierarchies
 */
export class ContainerFactory {
  private tenantConfig: TenantConfig
  private nodeMap: Map<string, dia.Element> = new Map()

  constructor(config: ContainerFactoryConfig) {
    this.tenantConfig = config.tenantConfig
    // layoutOptions passed to constructor but used in buildNestedGraph parameter
  }

  /**
   * Build a complete nested graph from account resources
   * Returns all cells (elements + links if any)
   */
  buildNestedGraph(resources: Resource[]): dia.Cell[] {
    this.nodeMap.clear()
    const cells: dia.Cell[] = []

    // Build all nodes recursively
    resources.forEach(resource => {
      const element = this.buildResourceHierarchy(resource, 0, null)
      cells.push(element)
      
      // Add all embedded children to cells array
      this.collectEmbeddedCells(element, cells)
    })

    return cells
  }

  /**
   * Recursively build a resource and its children
   * 
   * @param resource - Resource data to build
   * @param level - Hierarchy level (0 = Account, 5 = Block)
   * @param parentId - Parent element ID (null for root)
   * @returns Created element (container or resource node)
   */
  private buildResourceHierarchy(
    resource: Resource,
    level: number,
    parentId: string | null
  ): dia.Element {
    const hasChildren = resource.children && resource.children.length > 0
    const isLeafNode = level >= 5 || !hasChildren // Blocks (L5) are always leaf nodes

    let element: dia.Element

    if (isLeafNode) {
      // Create resource node for leaf nodes (Blocks)
      element = this.createResourceNode(resource, level, parentId)
    } else {
      // Create container node for parent resources (L0-L4)
      element = this.createContainerNode(resource, level, parentId)

      // Recursively create and embed children
      if (resource.children) {
        resource.children.forEach(childResource => {
          const childElement = this.buildResourceHierarchy(
            childResource,
            level + 1,
            element.id as string
          )
          
          // Embed child in parent
          element.embed(childElement)
          this.nodeMap.set(childResource.id, childElement)
        })
      }
    }

    this.nodeMap.set(resource.id, element)
    return element
  }

  /**
   * Create a container node for resources with children
   */
  private createContainerNode(
    resource: Resource,
    level: number,
    parentId: string | null
  ): dia.Element {
    const element = new ContainerNode({
      id: resource.id,
      position: { x: 0, y: 0 }, // Will be positioned by layout algorithm
      hierarchyLevel: level,
      expanded: true,
      attrs: {
        label: {
          text: resource.name
        }
      }
    })

    // Apply hierarchy-specific styling
    ;(element as any).applyHierarchyStyle()

    // Set DNA metadata
    this.setDNAMetadata(element, resource, level, parentId, true)

    return element
  }

  /**
   * Create a resource node for leaf resources (Blocks)
   */
  private createResourceNode(
    resource: Resource,
    level: number,
    parentId: string | null
  ): dia.Element {
    const resourceType = (resource.metadata?.resourceType as string) || resource.type || 'other'
    const iconUrl = getIconForResourceType(resourceType)
    const nodeStyle = this.tenantConfig.styles.nodes[resource.type] || this.tenantConfig.styles.defaultNode

    const element = new ResourceNode({
      id: resource.id,
      position: { x: 0, y: 0 }, // Will be positioned by layout algorithm
      size: { width: 160, height: 80 },
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
          x: 68, // (160 - 24) / 2
          y: 35
        },
        label: {
          text: resource.name,
          fill: '#ffffff',
          fontSize: 12,
          fontWeight: '600',
          y: 10,
          textAnchor: 'middle',
          textVerticalAnchor: 'top'
        }
      }
    })

    // Set DNA metadata
    this.setDNAMetadata(element, resource, level, parentId, false)

    return element
  }

  /**
   * Set DNA metadata on an element
   */
  private setDNAMetadata(
    element: dia.Element,
    resource: Resource,
    level: number,
    parentId: string | null,
    isContainer: boolean
  ): void {
    const metadata = resource.metadata || {}

    // Set DNA metadata properties
    element.set('dna', {
      resourceType: (metadata.resourceType as string) || resource.type || 'other',
      language: (metadata.language as string) || undefined,
      runtime: (metadata.runtime as string) || undefined,
      infrastructure: (metadata.infrastructure as string) || undefined,
      description: resource.description || (metadata.description as string) || undefined,
      // Process concerns
      status: (metadata.status as string) || undefined,
      version: (metadata.version as string) || undefined,
      lifecycle: (metadata.lifecycle as string) || undefined,
      // People concerns
      owner: (metadata.owner as string) || undefined,
      avatarUrl: (metadata.avatarUrl as string) || undefined,
      team: (metadata.team as string) || undefined,
      raci: (metadata.raci as string) || undefined,
      // Security concerns
      dataClassification: (metadata.dataClassification as string) || undefined,
      compliance: (metadata.compliance as string[]) || undefined,
      riskLevel: (metadata.riskLevel as string) || undefined,
      // Legacy fields
      type: undefined,
      priority: undefined
    })

    // Store hierarchy metadata
    element.set('hierarchyLevel', level)
    element.set('parentId', parentId)
    element.set('isContainer', isContainer)
  }

  /**
   * Collect all embedded cells recursively into flat array
   */
  private collectEmbeddedCells(element: dia.Element, cells: dia.Cell[]): void {
    const embeddedCells = element.getEmbeddedCells()
    embeddedCells.forEach(cell => {
      if (cell.isElement()) {
        cells.push(cell)
        this.collectEmbeddedCells(cell as dia.Element, cells)
      }
    })
  }

  /**
   * Get a node by resource ID (useful for creating links later)
   */
  getNodeById(id: string): dia.Element | undefined {
    return this.nodeMap.get(id)
  }

  /**
   * Get all created nodes
   */
  getAllNodes(): dia.Element[] {
    return Array.from(this.nodeMap.values())
  }

  /**
   * Clear internal state
   */
  clear(): void {
    this.nodeMap.clear()
  }
}
