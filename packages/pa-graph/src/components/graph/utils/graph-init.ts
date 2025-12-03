import { dia, shapes } from '@joint/plus'
import type { TenantConfig } from '../../../data/tenant-config'
import type { GraphInstance } from './types'

/**
 * Configuration for initializing a JointJS graph and paper
 */
interface GraphInitConfig {
  container: HTMLDivElement
  width: string | number
  height: string | number
  tenantConfig: TenantConfig
}

/**
 * Initialize a new JointJS graph and paper instance
 */
export function initializeGraph(config: GraphInitConfig): GraphInstance {
  const { container, width, height, tenantConfig } = config

  // Initialize graph
  const graph = new dia.Graph({}, { cellNamespace: shapes })

  // Initialize paper with tenant settings
  const paper = new dia.Paper({
    el: container,
    model: graph,
    width: typeof width === 'number' ? width : container.offsetWidth,
    height: typeof height === 'number' ? height : container.offsetHeight,
    gridSize: tenantConfig.settings?.gridSize || 10,
    drawGrid: tenantConfig.settings?.drawGrid ?? true,
    background: {
      color: tenantConfig.settings?.backgroundColor || '#f8f9fa'
    },
    cellViewNamespace: shapes,
    // Enable panning by dragging blank paper area
    interactive: { linkMove: false },
    // Restrict paper content transformations
    restrictTranslate: false,
    // Enable blank paper dragging for panning
    blank: true
  })

  return { graph, paper }
}

/**
 * Clean up graph and paper resources
 */
export function cleanupGraph(instance: GraphInstance): void {
  instance.paper.remove()
  instance.graph.clear()
}
