/**
 * DNA Platform Theme
 * Based on the dark blue interface design with brand colors
 */

import type { Theme } from '../../types/theme'

export const dnaPlatformTheme: Theme = {
  id: 'dna-platform',
  name: 'DNA Platform',
  colors: {
    // Backgrounds
    background: '#0a0f1e',
    backgroundSecondary: '#0f1729',
    backgroundTertiary: '#1a2744',
    
    // Borders
    border: '#1e3a5f',
    borderHover: '#2563eb',
    borderSelected: '#2563eb',
    
    // Text
    text: '#e2e8f0',
    textSecondary: '#94a3b8',
    textTertiary: '#64748b',
    
    // Interactive states
    hover: 'rgba(37, 99, 235, 0.1)',
    selected: 'rgba(37, 99, 235, 0.2)',
    active: '#2563eb',
    
    // Brand colors
    brand: {
      primary: '#2563eb',          // Blue - main brand color
      primaryHover: '#1d4ed8',
      primaryLight: 'rgba(37, 99, 235, 0.15)',
      secondary: '#0f1d3d',        // Dark blue - secondary surfaces
      secondaryHover: '#1a2744',
      accent: '#3b82f6',           // Lighter blue - accents
      accentHover: '#2563eb',
    },
  },
}
