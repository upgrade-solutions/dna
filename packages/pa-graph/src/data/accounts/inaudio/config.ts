/**
 * inAudio Account Configuration
 * Audiobook distribution platform
 */

import type { GraphStyles, TenantSettings } from '../../default-config'
import { baseNodeStyle, nodeTypeStyles } from '../../default-config'

// Base theme colors for inAudio audiobook distribution platform
const theme = {
  primary: '#6366f1',        // Vibrant indigo (audio/media brand)
  secondary: '#8b5cf6',      // Purple variant (creative arts)
  accent: '#ec4899',         // Pink accent (passion for stories)
  background: '#ffffff',     // Clean white
  surface: '#f9fafb',        // Light gray surface
  text: {
    primary: '#111827',      // Near black for primary text
    secondary: '#4b5563',    // Medium gray for secondary text
    muted: '#6b7280',        // Lighter gray for muted text
  },
  border: '#e5e7eb',         // Subtle border gray
  success: '#10b981',        // Green for positive actions
  warning: '#f59e0b',        // Amber for warnings
  error: '#ef4444',          // Red for errors/critical items
  info: '#3b82f6',           // Blue for informational elements
}

// Custom base node style for inAudio brand - inherits from theme
const inAudioNodeStyle = {
  ...baseNodeStyle,
  fill: theme.primary,
  stroke: theme.primary,
}

// Apply brand colors to all node types
const createBrandedNodes = () => {
  const nodes: Record<string, any> = {}
  for (const [type, typeStyle] of Object.entries(nodeTypeStyles)) {
    nodes[type] = { ...inAudioNodeStyle, ...typeStyle }
  }
  return nodes
}

export const inAudioConfig = {
  id: 'inaudio',
  name: 'INaudio',
  description: 'Audiobook distribution platform with Voices and Passport applications',
  
  theme,
  
  styles: {
    nodes: createBrandedNodes(),
    links: {
      'communicates-with': {
        stroke: theme.text.secondary,
        strokeWidth: 2
      },
      'depends-on': {
        stroke: theme.secondary,
        strokeWidth: 2,
        strokeDasharray: '6,4'
      },
      'reads-from': {
        stroke: theme.accent,
        strokeWidth: 2
      },
      'writes-to': {
        stroke: theme.warning,
        strokeWidth: 2
      },
      'contains': {
        stroke: theme.primary,
        strokeWidth: 3
      },
      'renders': {
        stroke: theme.info,
        strokeWidth: 2
      }
    },
    defaultNode: {
      ...inAudioNodeStyle,
      icon: 'https://api.iconify.design/mdi/cube-outline.svg?color=white'
    },
    defaultLink: {
      stroke: theme.text.secondary,
      strokeWidth: 2
    }
  } as GraphStyles,
  
  settings: {
    gridSize: 15,
    drawGrid: true,
    backgroundColor: theme.surface,
    autoLayout: 'grid'
  } as TenantSettings
}
