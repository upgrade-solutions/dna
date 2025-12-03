/**
 * Perfected Claims Theme
 * Professional insurance/claims management brand
 */

import type { Theme } from '../../types/theme'

export const perfectedClaimsTheme: Theme = {
  id: 'perfected-claims',
  name: 'Perfected Claims',
  colors: {
    // Backgrounds
    background: '#0f1419',
    backgroundSecondary: '#1a1f26',
    backgroundTertiary: '#252b33',
    
    // Borders
    border: '#2d3541',
    borderHover: '#10b981',
    borderSelected: '#10b981',
    
    // Text
    text: '#f3f4f6',
    textSecondary: '#9ca3af',
    textTertiary: '#6b7280',
    
    // Interactive states
    hover: 'rgba(16, 185, 129, 0.1)',
    selected: 'rgba(16, 185, 129, 0.2)',
    active: '#10b981',
    
    // Brand colors - Green theme for insurance/claims
    brand: {
      primary: '#10b981',          // Emerald green - trust & security
      primaryHover: '#059669',
      primaryLight: 'rgba(16, 185, 129, 0.15)',
      secondary: '#1e3a32',        // Dark green - professional
      secondaryHover: '#2d4a3f',
      accent: '#34d399',           // Light green - highlights
      accentHover: '#10b981',
    },
  },
}
