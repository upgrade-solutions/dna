/**
 * Theme configuration for pa-graph
 * Defines colors and visual styling for all UI components
 */

/**
 * Brand colors for account-specific themes
 * These are the core brand colors that define the visual identity
 */
export interface BrandColors {
  primary: string        // Main brand color
  primaryHover: string   // Hover state for primary
  primaryLight: string   // Light variant (backgrounds, highlights)
  secondary: string      // Secondary brand color
  secondaryHover: string // Hover state for secondary
  accent: string         // Accent color for highlights
  accentHover: string    // Hover state for accent
}

/**
 * Base theme colors - used for general themes (dark/light)
 * These provide the foundation that brand colors build upon
 */
export interface BaseThemeColors {
  // Backgrounds
  background: string           // Main background
  backgroundSecondary: string  // Secondary surfaces
  backgroundTertiary: string   // Tertiary surfaces (cards, panels)
  
  // Borders
  border: string               // Primary borders
  borderHover: string          // Hover state borders
  borderSelected: string       // Selected state borders
  
  // Text
  text: string                 // Primary text
  textSecondary: string        // Secondary text
  textTertiary: string         // Tertiary text (disabled, hints)
  
  // Interactive states
  hover: string                // Hover background
  selected: string             // Selected background
  active: string               // Active/pressed state
}

/**
 * Complete theme colors combining base theme and brand colors
 * Brand colors override or enhance base theme colors
 */
export interface ThemeColors extends BaseThemeColors {
  brand?: BrandColors  // Optional brand colors for account-specific themes
}

/**
 * Theme definition
 */
export interface Theme {
  id: string
  name: string
  colors: ThemeColors
}

/**
 * Helper to create themed colors for UI components
 * Maps brand colors to component-specific uses
 */
export function getThemedColors(theme: Theme) {
  const { colors } = theme
  const brand = colors.brand
  
  return {
    // Header uses base theme background
    header: {
      background: colors.backgroundSecondary,
      borderColor: colors.border,
      text: colors.text,
      textSecondary: colors.textSecondary,
      buttonActive: brand?.primary || colors.active,
      buttonInactive: colors.backgroundTertiary,
      buttonText: colors.text,
    },
    
    // Left sidebar uses darker/lighter variant
    leftSidebar: {
      background: colors.background,
      borderColor: colors.border,
      text: colors.text,
      textSecondary: colors.textSecondary,
      itemBorder: colors.border,
      itemBackground: 'transparent',
      itemBackgroundHover: brand?.primaryLight || colors.hover,
      itemBackgroundSelected: brand?.primaryLight || colors.selected,
      itemBorderHover: brand?.primary || colors.borderHover,
      itemBorderSelected: brand?.primary || colors.borderSelected,
      itemText: colors.textSecondary,
      itemTextHover: colors.text,
      itemTextSelected: colors.text,
    },
    
    // Right sidebar similar to left
    rightSidebar: {
      background: colors.background,
      borderColor: colors.border,
      text: colors.text,
      textSecondary: colors.textSecondary,
      tabBackground: colors.backgroundSecondary,
      tabBackgroundActive: brand?.secondary || colors.active,
      tabBackgroundHover: colors.hover,
      tabBorder: colors.border,
      tabText: colors.textSecondary,
      tabTextActive: colors.text,
    },
    
    // Toolbar uses secondary brand color
    toolbar: {
      background: brand?.secondary || colors.backgroundSecondary,
      borderColor: colors.border,
      text: colors.text,
      textSecondary: colors.textSecondary,
      buttonBackground: 'transparent',
      buttonBackgroundHover: colors.hover,
      buttonText: colors.textSecondary,
      buttonTextHover: colors.text,
      buttonPrimary: brand?.accent || colors.active,
      buttonPrimaryHover: brand?.accentHover || colors.active,
      divider: colors.border,
    },
    
    // Canvas
    canvas: {
      background: colors.background,
      gridColor: colors.border,
    },
  }
}
