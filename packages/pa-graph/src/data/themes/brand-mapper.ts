/**
 * Brand Color Mapper
 * Maps account-specific brand colors to theme components
 * Allows accounts to use either dark or light base themes with their brand colors
 */

import type { Theme, BrandColors } from '../../types/theme'
import { darkTheme } from './dark'
import { lightTheme } from './light'

/**
 * Account-specific brand color definitions
 */
export const accountBrandColors: Record<string, BrandColors> = {
  'dna-platform': {
    primary: '#2563eb',          // Vibrant blue
    primaryHover: '#1d4ed8',
    primaryLight: 'rgba(37, 99, 235, 0.15)',
    secondary: '#0f1d3d',        // Dark blue
    secondaryHover: '#1a2744',
    accent: '#3b82f6',           // Lighter blue
    accentHover: '#2563eb',
  },
  'inaudio': {
    primary: '#6366f1',          // Vibrant indigo
    primaryHover: '#5558e3',
    primaryLight: 'rgba(99, 102, 241, 0.15)',
    secondary: '#8b5cf6',        // Purple
    secondaryHover: '#7c3aed',
    accent: '#ec4899',           // Pink
    accentHover: '#db2777',
  },
  'perfected-claims': {
    primary: '#10b981',          // Emerald green
    primaryHover: '#059669',
    primaryLight: 'rgba(16, 185, 129, 0.15)',
    secondary: '#1e3a32',        // Dark green
    secondaryHover: '#2d4a3f',
    accent: '#34d399',           // Light green
    accentHover: '#10b981',
  },
}

/**
 * Creates a theme by combining a base theme (dark/light) with account brand colors
 */
export function createBrandedTheme(
  accountId: string,
  baseTheme: Theme = darkTheme
): Theme {
  const brandColors = accountBrandColors[accountId]
  
  if (!brandColors) {
    // No brand colors defined, return base theme
    return baseTheme
  }

  return {
    ...baseTheme,
    id: `${accountId}-${baseTheme.id}`,
    name: `${accountId} (${baseTheme.name})`,
    colors: {
      ...baseTheme.colors,
      brand: brandColors,
    },
  }
}

/**
 * Helper to get themed colors for a specific account
 * Defaults to dark theme with brand colors
 */
export function getAccountTheme(
  accountId: string,
  preferDark: boolean = true
): Theme {
  const baseTheme = preferDark ? darkTheme : lightTheme
  return createBrandedTheme(accountId, baseTheme)
}
