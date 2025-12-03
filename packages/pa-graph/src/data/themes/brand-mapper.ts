/**
 * Brand Color Mapper
 * Maps account-specific brand colors to theme components
 * Allows accounts to use either dark or light base themes with their brand colors
 */

import type { Theme, BrandColors } from '../../types/theme'
import { darkTheme } from './dark'
import { lightTheme } from './light'
import { dnaPlatformTheme } from '../accounts/dna-platform/config'
import { inAudioTheme } from '../accounts/inaudio/config'
import { perfectedClaimsTheme } from '../accounts/perfected-claims/config'

/**
 * Convert hex color to rgba with alpha
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Darken a hex color by a percentage
 */
function darkenColor(hex: string, percent: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - Math.round(255 * percent))
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - Math.round(255 * percent))
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - Math.round(255 * percent))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Extract brand colors from account theme configuration
 */
function toBrandColors(theme: typeof dnaPlatformTheme): BrandColors {
  return {
    primary: theme.primary,
    primaryHover: theme.secondary || darkenColor(theme.primary, 0.1),
    primaryLight: hexToRgba(theme.primary, 0.15),
    secondary: theme.secondary || darkenColor(theme.primary, 0.2),
    secondaryHover: theme.secondary ? darkenColor(theme.secondary, 0.1) : darkenColor(theme.primary, 0.3),
    accent: theme.accent || theme.primary,
    accentHover: theme.accent ? darkenColor(theme.accent, 0.1) : theme.secondary || darkenColor(theme.primary, 0.1),
  }
}

/**
 * Account-specific brand colors mapped from their theme definitions
 */
export const accountBrandColors: Record<string, BrandColors> = {
  'dna-platform': toBrandColors(dnaPlatformTheme),
  'inaudio': toBrandColors(inAudioTheme),
  'perfected-claims': toBrandColors(perfectedClaimsTheme),
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
 * Get themed colors for a specific account
 * Defaults to dark theme with brand colors
 */
export function getAccountTheme(
  accountId: string,
  preferDark: boolean = true
): Theme {
  const baseTheme = preferDark ? darkTheme : lightTheme
  return createBrandedTheme(accountId, baseTheme)
}
