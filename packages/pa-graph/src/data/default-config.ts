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
 * Default graph styles
 */
export const defaultStyles: GraphStyles = {
  nodes: {
    'web-app': {
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
      rx: 8,
      ry: 8
    },
    'api': {
      fill: '#10b981',
      stroke: '#047857',
      strokeWidth: 2,
      rx: 8,
      ry: 8
    },
    'database': {
      fill: '#f59e0b',
      stroke: '#d97706',
      strokeWidth: 2,
      rx: 8,
      ry: 8
    },
    'service': {
      fill: '#8b5cf6',
      stroke: '#6d28d9',
      strokeWidth: 2,
      rx: 8,
      ry: 8
    },
    'form': {
      fill: '#ec4899',
      stroke: '#db2777',
      strokeWidth: 2,
      rx: 8,
      ry: 8
    },
    'ui-component': {
      fill: '#06b6d4',
      stroke: '#0891b2',
      strokeWidth: 2,
      rx: 8,
      ry: 8
    }
  },
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
    fill: '#6b7280',
    stroke: '#4b5563',
    strokeWidth: 2,
    rx: 8,
    ry: 8
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
