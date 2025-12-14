import { dia } from '@joint/plus'
import type { ConcernDecorator, Corner, ResourceDNA } from './layer-types'
import { CORNER_SELECTORS } from './layer-types'

/**
 * Base decorator class with common functionality
 */
abstract class BaseConcernDecorator implements ConcernDecorator {
  abstract getValue(cell: dia.Cell): string | string[] | null
  abstract getIcon(value: string): string
  
  getColor?(value: string): string
  getText?(value: string): string | null
  
  apply(cell: dia.Cell, corner: Corner): void {
    if (cell.isLink()) return
    
    const value = this.getValue(cell)
    if (!value) return
    
    // Handle array values (e.g., compliance)
    const displayValue = Array.isArray(value) ? value[0] : value
    if (!displayValue) return
    
    const selectors = CORNER_SELECTORS[corner]
    
    // Show circle background and apply color if available
    cell.attr(`${selectors.circle}/opacity`, 1)
    if (this.getColor) {
      const color = this.getColor(displayValue)
      cell.attr(`${selectors.circle}/fill`, color)
    }
    
    // Store tooltip data as a custom data attribute
    const tooltipText = Array.isArray(value) ? value.join(', ') : value
    cell.attr(`${selectors.circle}/data-tooltip`, tooltipText)
    
    // Check if this decorator uses text instead of icon
    if (this.getText) {
      const text = this.getText(displayValue)
      if (text) {
        // Show text, hide icon
        cell.attr(`${selectors.text}/text`, text)
        cell.attr(`${selectors.text}/opacity`, 1)
        cell.attr(`${selectors.text}/data-tooltip`, tooltipText)
        cell.attr(`${selectors.badge}/opacity`, 0)
        return
      }
    }
    
    // Show icon, hide text
    const iconUrl = this.getIcon(displayValue)
    cell.attr(`${selectors.badge}/href`, iconUrl)
    cell.attr(`${selectors.badge}/xlink:href`, iconUrl)
    cell.attr(`${selectors.badge}/opacity`, 1)
    cell.attr(`${selectors.badge}/data-tooltip`, tooltipText)
    cell.attr(`${selectors.text}/opacity`, 0)
  }
  
  remove(cell: dia.Cell, corner: Corner): void {
    if (cell.isLink()) return
    
    const selectors = CORNER_SELECTORS[corner]
    
    // Hide circle, badge, and text
    cell.attr(`${selectors.circle}/opacity`, 0)
    cell.attr(`${selectors.badge}/opacity`, 0)
    cell.attr(`${selectors.text}/opacity`, 0)
  }
}

// ============================================================================
// PROCESS CATEGORY DECORATORS (Top-Left)
// ============================================================================

/**
 * Status decorator - shows health status (up, degraded, down)
 */
export class StatusDecorator extends BaseConcernDecorator {
  getValue(cell: dia.Cell): string | null {
    const dna = cell.get('dna') as ResourceDNA | undefined
    return dna?.status || null
  }
  
  getIcon(value: string): string {
    const icons: Record<string, string> = {
      'up': 'mdi:check',
      'degraded': 'mdi:alert',
      'down': 'mdi:alert'
    }
    const iconName = icons[value] || 'mdi:help-circle'
    return `https://api.iconify.design/${iconName}.svg?color=ffffff`
  }
  
  getColor(value: string): string {
    const colors: Record<string, string> = {
      'up': '#10b981',
      'degraded': '#f59e0b',
      'down': '#ef4444'
    }
    return colors[value] || '#6b7280'
  }
}

/**
 * Version decorator - shows version number
 */
export class VersionDecorator extends BaseConcernDecorator {
  getValue(cell: dia.Cell): string | null {
    const dna = cell.get('dna') as ResourceDNA | undefined
    return dna?.version || null
  }
  
  getText(value: string): string | null {
    // Extract major version and display as "v1", "v2", etc.
    const match = value.match(/^v?(\d+)/)
    if (match) {
      return `v${match[1]}`
    }
    return null
  }
  
  getIcon(_value: string): string {
    return 'https://api.iconify.design/mdi:tag.svg?color=ffffff'
  }
  
  getColor(_value: string): string {
    return '#3b82f6'
  }
  
  // Override apply to customize circle styling for version badges
  apply(cell: dia.Cell, corner: Corner): void {
    if (cell.isLink()) return
    
    const value = this.getValue(cell)
    if (!value) return
    
    const selectors = CORNER_SELECTORS[corner]
    
    // Show circle with custom styling - background same as node, stroke is theme color
    cell.attr(`${selectors.circle}/opacity`, 1)
    cell.attr(`${selectors.circle}/fill`, '#1f2937') // Same as node background
    cell.attr(`${selectors.circle}/stroke`, '#3b82f6') // Blue theme color
    cell.attr(`${selectors.circle}/strokeWidth`, 2)
    
    // Store full version in tooltip
    cell.attr(`${selectors.circle}/data-tooltip`, value)
    
    // Check if we can display as text
    const text = this.getText(value)
    if (text) {
      // Show text, hide icon
      cell.attr(`${selectors.text}/text`, text)
      cell.attr(`${selectors.text}/opacity`, 1)
      cell.attr(`${selectors.text}/fill`, '#3b82f6') // Blue text color
      cell.attr(`${selectors.text}/data-tooltip`, value)
      cell.attr(`${selectors.badge}/opacity`, 0)
    } else {
      // Show icon, hide text
      const iconUrl = this.getIcon(value)
      cell.attr(`${selectors.badge}/href`, iconUrl)
      cell.attr(`${selectors.badge}/xlink:href`, iconUrl)
      cell.attr(`${selectors.badge}/opacity`, 1)
      cell.attr(`${selectors.badge}/data-tooltip`, value)
      cell.attr(`${selectors.text}/opacity`, 0)
    }
  }
}

/**
 * Lifecycle decorator - shows lifecycle stage (design, build, run)
 */
export class LifecycleDecorator extends BaseConcernDecorator {
  getValue(cell: dia.Cell): string | null {
    const dna = cell.get('dna') as ResourceDNA | undefined
    return dna?.lifecycle || null
  }
  
  getIcon(value: string): string {
    const icons: Record<string, string> = {
      'design': 'mdi:pencil-ruler',
      'build': 'mdi:hammer-wrench',
      'run': 'mdi:play-circle'
    }
    const iconName = icons[value] || 'mdi:help-circle'
    return `https://api.iconify.design/${iconName}.svg?color=8b5cf6`
  }
  
  getColor(_value: string): string {
    return '#8b5cf6'
  }
}

// ============================================================================
// TECHNOLOGY CATEGORY DECORATORS (Top-Right)
// ============================================================================

/**
 * Language decorator - shows programming language
 */
export class LanguageDecorator extends BaseConcernDecorator {
  getValue(cell: dia.Cell): string | null {
    const dna = cell.get('dna') as ResourceDNA | undefined
    return dna?.language || null
  }
  
  getIcon(language: string): string {
    const icons: Record<string, string> = {
      'typescript': 'mdi:language-typescript',
      'javascript': 'mdi:language-javascript',
      'python': 'mdi:language-python',
      'go': 'mdi:language-go',
      'rust': 'mdi:language-rust',
      'java': 'mdi:language-java',
      'csharp': 'mdi:language-csharp',
      'php': 'mdi:language-php',
      'ruby': 'mdi:language-ruby',
    }
    const iconName = icons[language.toLowerCase()] || 'mdi:code-braces'
    return `https://api.iconify.design/${iconName}.svg?color=white`
  }
}

/**
 * Runtime decorator - shows runtime/platform
 */
export class RuntimeDecorator extends BaseConcernDecorator {
  getValue(cell: dia.Cell): string | null {
    const dna = cell.get('dna') as ResourceDNA | undefined
    return dna?.runtime || null
  }
  
  getIcon(runtime: string): string {
    const icons: Record<string, string> = {
      'deno': 'mdi:alpha-d-box',
      'nodejs': 'mdi:nodejs',
      'bun': 'mdi:bee',
      'python': 'mdi:language-python',
      'go': 'mdi:language-go',
      'docker': 'mdi:docker',
      'kubernetes': 'mdi:kubernetes',
      'postgresql': 'mdi:database',
      'mysql': 'mdi:database',
      'mongodb': 'mdi:database',
      'redis': 'mdi:database-cog',
      'rabbitmq': 'mdi:rabbit',
      'kafka': 'mdi:apache-kafka',
    }
    const iconName = icons[runtime.toLowerCase()] || 'mdi:cog'
    return `https://api.iconify.design/${iconName}.svg?color=white`
  }
}

/**
 * Infrastructure decorator - shows infrastructure type
 */
export class InfrastructureDecorator extends BaseConcernDecorator {
  getValue(cell: dia.Cell): string | null {
    const dna = cell.get('dna') as ResourceDNA | undefined
    return dna?.infrastructure || null
  }
  
  getIcon(infra: string): string {
    const icons: Record<string, string> = {
      'database': 'mdi:database',
      'queue': 'mdi:message-processing',
      'service': 'mdi:server'
    }
    const iconName = icons[infra] || 'mdi:cloud'
    return `https://api.iconify.design/${iconName}.svg?color=white`
  }
}

// ============================================================================
// PEOPLE CATEGORY DECORATORS (Bottom-Left)
// ============================================================================

/**
 * Owner decorator - shows resource owner with avatar
 */
export class OwnerDecorator extends BaseConcernDecorator {
  getValue(cell: dia.Cell): string | null {
    const dna = cell.get('dna') as ResourceDNA | undefined
    return dna?.owner || null
  }
  
  getIcon(_value: string): string {
    // Check if the cell has an avatarUrl in its DNA
    const cell = arguments[1] as dia.Cell | undefined
    if (cell) {
      const dna = cell.get('dna') as ResourceDNA | undefined
      if (dna?.avatarUrl) {
        return dna.avatarUrl
      }
    }
    // Fallback to UI Avatars generated from name
    return 'https://api.iconify.design/mdi:account.svg?color=ec4899'
  }
  
  apply(cell: dia.Cell, corner: Corner): void {
    if (cell.isLink()) return
    
    const value = this.getValue(cell)
    if (!value) return
    
    const dna = cell.get('dna') as ResourceDNA | undefined
    const selectors = CORNER_SELECTORS[corner]
    const hasAvatar = !!dna?.avatarUrl
    
    // Always show circle with original dark border (defined in ResourceNode.ts)
    cell.attr(`${selectors.circle}/opacity`, 1)
    cell.attr(`${selectors.circle}/data-tooltip`, value)
    
    // Calculate position based on corner
    const yPos = corner.includes('bottom') ? 65 : -15
    const xPos = corner.includes('right') ? 145 : -15
    
    // If avatar exists, make circle background transparent so image shows through
    // If no avatar, use pink background for UI Avatars initials
    if (hasAvatar) {
      cell.attr(`${selectors.circle}/fill`, 'transparent')
      const imageUrl = dna.avatarUrl
      // Make image slightly larger (30x30) to fill past the 2px stroke border
      cell.attr(`${selectors.badge}/href`, imageUrl)
      cell.attr(`${selectors.badge}/xlink:href`, imageUrl)
      cell.attr(`${selectors.badge}/opacity`, 1)
      cell.attr(`${selectors.badge}/data-tooltip`, value)
      cell.attr(`${selectors.badge}/width`, 30)
      cell.attr(`${selectors.badge}/height`, 30)
      cell.attr(`${selectors.badge}/x`, xPos)
      cell.attr(`${selectors.badge}/y`, yPos)
    } else {
      // No avatar - use UI Avatars with pink background and white initials
      cell.attr(`${selectors.circle}/fill`, 'transparent')
      const imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(value)}&size=128&background=ec4899&color=fff&bold=true&rounded=true`
      cell.attr(`${selectors.badge}/href`, imageUrl)
      cell.attr(`${selectors.badge}/xlink:href`, imageUrl)
      cell.attr(`${selectors.badge}/opacity`, 1)
      cell.attr(`${selectors.badge}/data-tooltip`, value)
      cell.attr(`${selectors.badge}/width`, 30)
      cell.attr(`${selectors.badge}/height`, 30)
      cell.attr(`${selectors.badge}/x`, xPos)
      cell.attr(`${selectors.badge}/y`, yPos)
    }
    
    cell.attr(`${selectors.text}/opacity`, 0)
  }
  
  getColor(_value: string): string {
    return '#ec4899'
  }
}

/**
 * Team decorator - shows team/department
 */
export class TeamDecorator extends BaseConcernDecorator {
  getValue(cell: dia.Cell): string | null {
    const dna = cell.get('dna') as ResourceDNA | undefined
    return dna?.team || null
  }
  
  getIcon(_value: string): string {
    return 'https://api.iconify.design/mdi:account-group.svg?color=06b6d4'
  }
  
  getColor(_value: string): string {
    return '#06b6d4'
  }
}

/**
 * RACI decorator - shows RACI role
 */
export class RACIDecorator extends BaseConcernDecorator {
  getValue(cell: dia.Cell): string | null {
    const dna = cell.get('dna') as ResourceDNA | undefined
    return dna?.raci || null
  }
  
  getIcon(value: string): string {
    const icons: Record<string, string> = {
      'responsible': 'mdi:account-check',
      'accountable': 'mdi:account-star',
      'consulted': 'mdi:account-question',
      'informed': 'mdi:account-details'
    }
    const iconName = icons[value] || 'mdi:account'
    return `https://api.iconify.design/${iconName}.svg?color=84cc16`
  }
  
  getColor(_value: string): string {
    return '#84cc16'
  }
}

// ============================================================================
// SECURITY CATEGORY DECORATORS (Bottom-Right)
// ============================================================================

/**
 * Data Classification decorator - shows data sensitivity
 */
export class DataClassificationDecorator extends BaseConcernDecorator {
  getValue(cell: dia.Cell): string | null {
    const dna = cell.get('dna') as ResourceDNA | undefined
    return dna?.dataClassification || null
  }
  
  getIcon(value: string): string {
    const icons: Record<string, string> = {
      'pii': 'mdi:shield-alert',
      'pci': 'mdi:credit-card-lock',
      'internal': 'mdi:shield-check'
    }
    const iconName = icons[value] || 'mdi:shield'
    const color = this.getColor ? this.getColor(value) : 'dc2626'
    return `https://api.iconify.design/${iconName}.svg?color=${color.replace('#', '')}`
  }
  
  getColor(value: string): string {
    const colors: Record<string, string> = {
      'pii': '#dc2626',
      'pci': '#ea580c',
      'internal': '#65a30d'
    }
    return colors[value] || '#6b7280'
  }
}

/**
 * Compliance decorator - shows compliance requirements
 */
export class ComplianceDecorator extends BaseConcernDecorator {
  getValue(cell: dia.Cell): string | string[] | null {
    const dna = cell.get('dna') as ResourceDNA | undefined
    return dna?.compliance || null
  }
  
  getIcon(value: string): string {
    const icons: Record<string, string> = {
      'soc2': 'mdi:certificate',
      'hipaa': 'mdi:hospital-box',
      'gdpr': 'mdi:shield-check',
      'pci': 'mdi:credit-card-lock'
    }
    const iconName = icons[value.toLowerCase()] || 'mdi:file-certificate'
    return `https://api.iconify.design/${iconName}.svg?color=0284c7`
  }
  
  getColor(_value: string): string {
    return '#0284c7'
  }
}

/**
 * Risk Level decorator - shows security risk level
 */
export class RiskLevelDecorator extends BaseConcernDecorator {
  getValue(cell: dia.Cell): string | null {
    const dna = cell.get('dna') as ResourceDNA | undefined
    return dna?.riskLevel || null
  }
  
  getIcon(value: string): string {
    const icons: Record<string, string> = {
      'high': 'mdi:alert-octagon',
      'medium': 'mdi:alert',
      'low': 'mdi:check-circle'
    }
    const iconName = icons[value] || 'mdi:help-circle'
    const color = this.getColor ? this.getColor(value) : 'f59e0b'
    return `https://api.iconify.design/${iconName}.svg?color=${color.replace('#', '')}`
  }
  
  getColor(value: string): string {
    const colors: Record<string, string> = {
      'high': '#dc2626',
      'medium': '#f59e0b',
      'low': '#10b981'
    }
    return colors[value] || '#6b7280'
  }
}
