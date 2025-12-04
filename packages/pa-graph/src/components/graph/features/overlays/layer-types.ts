import { dia } from '@joint/plus'

/**
 * Corner positions for category badges
 */
export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

/**
 * Category identifiers
 */
export type CategoryId = 'process' | 'technology' | 'people' | 'security'

/**
 * DNA interface with all possible concern properties
 */
export interface ResourceDNA {
  // Base resource info
  type?: string
  name?: string
  
  // Process concerns
  status?: 'up' | 'degraded' | 'down'
  version?: string
  lifecycle?: 'design' | 'build' | 'run'
  
  // Technology concerns
  language?: string
  runtime?: string
  infrastructure?: 'database' | 'queue' | 'service'
  
  // People concerns
  owner?: string
  team?: string
  raci?: 'responsible' | 'accountable' | 'consulted' | 'informed'
  
  // Security concerns
  dataClassification?: 'pii' | 'pci' | 'internal'
  compliance?: string[]  // ['soc2', 'hipaa']
  riskLevel?: 'high' | 'medium' | 'low'
}

/**
 * Configuration for a single concern within a category
 */
export interface ConcernConfig {
  id: string              // e.g., 'status', 'language', 'owner'
  name: string            // Display name
  getValue: (dna: ResourceDNA) => string | string[] | null  // Extract value from DNA
}

/**
 * Configuration for a category (mapped to a corner)
 */
export interface CategoryConfig {
  id: CategoryId
  name: string
  corner: Corner
  enabled: boolean                // Is this category visible?
  activeConcern: string | null    // Which concern is currently shown
  concerns: ConcernConfig[]       // Available concerns for this category
}

/**
 * Decorator interface for applying concern visualizations
 */
export interface ConcernDecorator {
  /**
   * Apply the decorator to a cell at the specified corner
   */
  apply(cell: dia.Cell, corner: Corner): void
  
  /**
   * Remove the decorator from a cell at the specified corner
   */
  remove(cell: dia.Cell, corner: Corner): void
  
  /**
   * Get the value for this concern from a cell's DNA
   */
  getValue(cell: dia.Cell): string | string[] | null
  
  /**
   * Get the icon URL for a given value
   */
  getIcon(value: string): string
  
  /**
   * Get the color for a given value
   */
  getColor?(value: string): string
}

/**
 * Map corner positions to badge selectors in JointJS markup
 */
export const CORNER_SELECTORS: Record<Corner, string> = {
  'top-left': 'topLeftBadge',
  'top-right': 'topRightBadge',
  'bottom-left': 'bottomLeftBadge',
  'bottom-right': 'bottomRightBadge'
}

/**
 * Map corner positions to coordinates (for 160x80px node)
 */
export const CORNER_POSITIONS: Record<Corner, { x: number, y: number }> = {
  'top-left': { x: 10, y: 10 },
  'top-right': { x: 130, y: 10 },
  'bottom-left': { x: 10, y: 50 },
  'bottom-right': { x: 130, y: 50 }
}

/**
 * Badge size standard
 */
export const BADGE_SIZE = 20
