/**
 * Default tenant configuration template
 * Used as fallback and starting point for new tenants
 */

export interface NodeStyle {
  fill: string
  stroke: string
  strokeWidth?: number
  rx?: number
  ry?: number
  icon?: string
}

export interface LinkStyle {
  stroke: string
  strokeWidth?: number
  strokeDasharray?: string
}

export interface GraphStyles {
  nodes: Record<string, NodeStyle>
  links: Record<string, LinkStyle>
  defaultNode: NodeStyle
  defaultLink: LinkStyle
}

export interface TenantSettings {
  gridSize?: number
  drawGrid?: boolean
  backgroundColor?: string
  autoLayout?: 'grid' | 'dagre' | 'force-directed'
}

/**
 * Base node style configuration - shared across all node types
 */
export const baseNodeStyle = {
  fill: '#ffffff',
  stroke: '#000000',
  strokeWidth: 1,
  rx: 8,
  ry: 8
}

/**
 * Node type definitions - only unique properties per type
 * All nodes inherit from baseNodeStyle
 */
export const nodeTypeStyles = {
  'web-application': {
    icon: 'https://api.iconify.design/mdi/web.svg?color=white'
  },
  'web-app': {
    icon: 'https://api.iconify.design/mdi/web.svg?color=white'
  },
  'api': {
    icon: 'https://api.iconify.design/mdi/api.svg?color=white'
  },
  'database': {
    icon: 'https://api.iconify.design/mdi/database.svg?color=white'
  },
  'service': {
    icon: 'https://api.iconify.design/mdi/cog.svg?color=white'
  },
  'form': {
    icon: 'https://api.iconify.design/mdi/form-select.svg?color=white'
  },
  'form-component': {
    icon: 'https://api.iconify.design/mdi/form-select.svg?color=white'
  },
  'ui-component': {
    icon: 'https://api.iconify.design/mdi/view-dashboard.svg?color=white'
  }
}

/**
 * Combine base style with type-specific styles to create complete node styles
 */
const createNodeStyles = (): Record<string, NodeStyle> => {
  const result: Record<string, NodeStyle> = {}
  for (const [type, typeStyle] of Object.entries(nodeTypeStyles)) {
    result[type] = { ...baseNodeStyle, ...typeStyle }
  }
  return result
}

/**
 * Default graph styles
 */
export const defaultStyles = {
  nodes: createNodeStyles(),
  links: {
    'communicates-with': {
      stroke: '#6b7280',
      strokeWidth: 2
    },
    'depends-on': {
      stroke: '#9333ea',
      strokeWidth: 2,
      strokeDasharray: '5,5'
    },
    'reads-from': {
      stroke: '#059669',
      strokeWidth: 2
    },
    'writes-to': {
      stroke: '#dc2626',
      strokeWidth: 2
    },
    'contains': {
      stroke: '#2563eb',
      strokeWidth: 3
    },
    'renders': {
      stroke: '#7c3aed',
      strokeWidth: 2
    }
  },
  defaultNode: {
    ...baseNodeStyle,
    fill: '#6b7280',
    stroke: '#4b5563',
    icon: 'https://api.iconify.design/mdi/cube-outline.svg?color=white'
  },
  defaultLink: {
    stroke: '#6b7280',
    strokeWidth: 2
  }
}

/**
 * Default settings
 */
export const defaultSettings: TenantSettings = {
  gridSize: 10,
  drawGrid: true,
  backgroundColor: '#f8f9fa',
  autoLayout: 'grid'
}
