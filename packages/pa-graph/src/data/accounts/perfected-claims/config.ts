/**
 * Perfected Claims Account Configuration
 * Mass tort case management platform
 */

import type { GraphStyles, TenantSettings } from '../../default-config'

export const perfectedClaimsConfig = {
  id: 'perfected-claims',
  name: 'Perfected Claims',
  description: 'Mass tort case management platform (perfectedclaims.com)',
  
  // Base theme colors derived from perfectedclaims.com
  theme: {
    primary: '#1a4d8f',        // Deep professional blue (main brand color)
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
  },
  
  styles: {
    nodes: {
      'web-app': {
        fill: '#1a4d8f',
        stroke: '#0f2d5a',
        strokeWidth: 2,
        rx: 10,
        ry: 10
      },
      'api': {
        fill: '#1a4d8f',
        stroke: '#0f2d5a',
        strokeWidth: 2,
        rx: 10,
        ry: 10
      },
      'database': {
        fill: '#1a4d8f',
        stroke: '#0f2d5a',
        strokeWidth: 2,
        rx: 10,
        ry: 10
      },
      'service': {
        fill: '#1a4d8f',
        stroke: '#0f2d5a',
        strokeWidth: 2,
        rx: 10,
        ry: 10
      },
      'form': {
        fill: '#1a4d8f',
        stroke: '#0f2d5a',
        strokeWidth: 2,
        rx: 10,
        ry: 10
      },
      'ui-component': {
        fill: '#1a4d8f',
        stroke: '#0f2d5a',
        strokeWidth: 2,
        rx: 10,
        ry: 10
      }
    },
    links: {
      'communicates-with': {
        stroke: '#4a5568',
        strokeWidth: 2
      },
      'depends-on': {
        stroke: '#2c5aa0',
        strokeWidth: 2,
        strokeDasharray: '6,4'
      },
      'reads-from': {
        stroke: '#3d7a3f',
        strokeWidth: 2
      },
      'writes-to': {
        stroke: '#d97706',
        strokeWidth: 2
      },
      'contains': {
        stroke: '#1a4d8f',
        strokeWidth: 3
      },
      'renders': {
        stroke: '#0284c7',
        strokeWidth: 2
      }
    },
    defaultNode: {
      fill: '#1a4d8f',
      stroke: '#0f2d5a',
      strokeWidth: 2,
      rx: 10,
      ry: 10
    },
    defaultLink: {
      stroke: '#4a5568',
      strokeWidth: 2
    }
  } as GraphStyles,
  
  settings: {
    gridSize: 15,
    drawGrid: true,
    backgroundColor: '#f8f9fa',
    autoLayout: 'grid'
  } as TenantSettings
}
