/**
 * inAudio Theme
 * Creative audio/media production brand
 */

import type { Theme } from '../../types/theme'

export const inAudioTheme: Theme = {
  id: 'inaudio',
  name: 'inAudio',
  colors: {
    // Backgrounds
    background: '#0a0a0f',
    backgroundSecondary: '#14141f',
    backgroundTertiary: '#1f1f2e',
    
    // Borders
    border: '#2d2d42',
    borderHover: '#8b5cf6',
    borderSelected: '#8b5cf6',
    
    // Text
    text: '#f5f5f7',
    textSecondary: '#a3a3b8',
    textTertiary: '#71717a',
    
    // Interactive states
    hover: 'rgba(139, 92, 246, 0.1)',
    selected: 'rgba(139, 92, 246, 0.2)',
    active: '#8b5cf6',
    
    // Brand colors - Purple/Violet theme for audio/creative
    brand: {
      primary: '#8b5cf6',          // Violet - creative & audio
      primaryHover: '#7c3aed',
      primaryLight: 'rgba(139, 92, 246, 0.15)',
      secondary: '#2e1065',        // Deep purple - media
      secondaryHover: '#3f1a7d',
      accent: '#a78bfa',           // Light violet - playful
      accentHover: '#8b5cf6',
    },
  },
}
