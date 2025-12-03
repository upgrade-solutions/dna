/**
 * Dark Theme
 * General purpose dark color scheme
 */

import type { Theme } from '../../types/theme'

export const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  colors: {
    // Backgrounds
    background: '#1e1e1e',
    backgroundSecondary: '#1f2937',
    backgroundTertiary: '#374151',
    
    // Borders
    border: '#333333',
    borderHover: '#3b82f6',
    borderSelected: '#3b82f6',
    
    // Text
    text: '#ffffff',
    textSecondary: '#9ca3af',
    textTertiary: '#6b7280',
    
    // Interactive states
    hover: 'rgba(59, 130, 246, 0.1)',
    selected: 'rgba(59, 130, 246, 0.2)',
    active: '#3b82f6',
  },
}
