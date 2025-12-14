/**
 * Perfected Claims Account Configuration
 * Mass tort case management platform
 */

import type { GraphStyles, TenantSettings } from '../../default-config'
import { baseNodeStyle, nodeTypeStyles } from '../../default-config'

// Base theme colors derived from perfectedclaims.com
export const perfectedClaimsTheme = {
  primary: '#005761',        // Deep teal (main brand color)
  secondary: '#2c5aa0',      // Lighter blue variant
  accent: '#3d7a3f',         // Justice green (accountability)
  background: '#ffffff',     // Clean white
  surface: '#f8f9fa',        // Light gray surface
  text: {
    primary: '#1a1a1a',      // Near black for primary text
    secondary: '#4a5568',    // Medium gray for secondary text
    muted: '#718096',        // Lighter gray for muted text
  },
  border: '#e2e8f0',         // Subtle border gray
  success: '#059669',        // Green for positive actions
  warning: '#d97706',        // Amber for warnings
  error: '#dc2626',          // Red for errors/critical items
  info: '#0284c7',           // Sky blue for informational elements
}

// Custom base node style for Perfected Claims brand - inherits from theme
const perfectedClaimsNodeStyle = {
  ...baseNodeStyle,
  fill: perfectedClaimsTheme.primary,
  stroke: perfectedClaimsTheme.primary,
}

// Apply brand colors to all node types
const createBrandedNodes = () => {
  const nodes: Record<string, any> = {}
  for (const [type, typeStyle] of Object.entries(nodeTypeStyles)) {
    nodes[type] = { ...perfectedClaimsNodeStyle, ...typeStyle }
  }
  return nodes
}

export const perfectedClaimsConfig = {
  id: 'perfected-claims',
  name: 'Perfected Claims',
  description: 'Mass tort case management platform (perfectedclaims.com)',
  styles: {
    nodes: createBrandedNodes(),
    links: {
      'communicates-with': {
        stroke: perfectedClaimsTheme.text.secondary,
        strokeWidth: 2
      },
      'depends-on': {
        stroke: perfectedClaimsTheme.secondary,
        strokeWidth: 2,
        strokeDasharray: '6,4'
      },
      'reads-from': {
        stroke: perfectedClaimsTheme.accent,
        strokeWidth: 2
      },
      'writes-to': {
        stroke: perfectedClaimsTheme.warning,
        strokeWidth: 2
      },
      'contains': {
        stroke: perfectedClaimsTheme.primary,
        strokeWidth: 3
      },
      'renders': {
        stroke: perfectedClaimsTheme.info,
        strokeWidth: 2
      }
    },
    defaultNode: {
      ...perfectedClaimsNodeStyle,
      icon: 'https://api.iconify.design/mdi/cube-outline.svg?color=white'
    },
    defaultLink: {
      stroke: perfectedClaimsTheme.text.secondary,
      strokeWidth: 2
    }
  } as GraphStyles,
  
  settings: {
    gridSize: 15,
    drawGrid: true,
    backgroundColor: perfectedClaimsTheme.surface,
    autoLayout: 'grid'
  } as TenantSettings
}
