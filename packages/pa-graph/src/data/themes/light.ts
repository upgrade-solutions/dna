/**
 * Light Theme
 * General purpose light color scheme
 */

import type { Theme } from '../../types/theme'

export const lightTheme: Theme = {
  id: 'light',
  name: 'Light',
  colors: {
    // Backgrounds
    background: '#ffffff',
    backgroundSecondary: '#f9fafb',
    backgroundTertiary: '#f3f4f6',
    
    // Borders
    border: '#e5e7eb',
    borderHover: '#3b82f6',
    borderSelected: '#3b82f6',
    
    // Text
    text: '#111827',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    
    // Interactive states
    hover: 'rgba(59, 130, 246, 0.1)',
    selected: 'rgba(59, 130, 246, 0.15)',
    active: '#3b82f6',
  },
}
