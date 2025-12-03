/**
 * DNA Platform Account Configuration
 * BizOps-as-Code platform architecture
 */

import type { GraphStyles, TenantSettings } from '../../default-config'
import { baseNodeStyle, nodeTypeStyles } from '../../default-config'

// Base theme colors for DNA Platform
export const dnaPlatformTheme = {
  primary: '#2563eb',        // Vibrant blue (brand identity)
  secondary: '#1e40af',      // Darker blue variant
  accent: '#3b82f6',         // Lighter blue accent
  background: '#0a0f1e',     // Deep navy background
  surface: '#0f1729',        // Slightly lighter surface
  text: {
    primary: '#e2e8f0',      // Light gray for primary text
    secondary: '#94a3b8',    // Medium gray for secondary text
    muted: '#64748b',        // Muted gray for tertiary text
  },
  border: '#1e3a5f',         // Subtle blue-gray border
  success: '#10b981',        // Green for positive actions
  warning: '#f59e0b',        // Amber for warnings
  error: '#ef4444',          // Red for errors/critical items
  info: '#3b82f6',           // Blue for informational elements
}

// Custom base node style for DNA Platform brand - inherits from theme
const dnaPlatformNodeStyle = {
  ...baseNodeStyle,
  fill: dnaPlatformTheme.primary,
  stroke: dnaPlatformTheme.primary,
}

// Apply brand colors to all node types
const createBrandedNodes = () => {
  const nodes: Record<string, any> = {}
  for (const [type, typeStyle] of Object.entries(nodeTypeStyles)) {
    nodes[type] = { ...dnaPlatformNodeStyle, ...typeStyle }
  }
  return nodes
}

export const dnaPlatformConfig = {
  id: 'dna-platform',
  name: 'DNA Platform',
  description: 'BizOps-as-Code platform architecture',
  styles: {
    nodes: createBrandedNodes(),
    links: {
      'communicates-with': {
        stroke: dnaPlatformTheme.text.secondary,
        strokeWidth: 2
      },
      'depends-on': {
        stroke: dnaPlatformTheme.secondary,
        strokeWidth: 2,
        strokeDasharray: '6,4'
      },
      'reads-from': {
        stroke: dnaPlatformTheme.accent,
        strokeWidth: 2
      },
      'writes-to': {
        stroke: dnaPlatformTheme.warning,
        strokeWidth: 2
      },
      'contains': {
        stroke: dnaPlatformTheme.primary,
        strokeWidth: 3
      },
      'renders': {
        stroke: dnaPlatformTheme.info,
        strokeWidth: 2
      }
    },
    defaultNode: {
      ...dnaPlatformNodeStyle,
      icon: 'https://api.iconify.design/mdi/cube-outline.svg?color=white'
    },
    defaultLink: {
      stroke: dnaPlatformTheme.text.secondary,
      strokeWidth: 2
    }
  } as GraphStyles,
  
  settings: {
    gridSize: 15,
    drawGrid: true,
    backgroundColor: dnaPlatformTheme.surface,
    autoLayout: 'grid'
  } as TenantSettings
}
