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
  
  apply(cell: dia.Cell, corner: Corner): void {
    if (cell.isLink()) return
    
    const value = this.getValue(cell)
    if (!value) return
    
    // Handle array values (e.g., compliance)
    const displayValue = Array.isArray(value) ? value[0] : value
    if (!displayValue) return
    
    const iconUrl = this.getIcon(displayValue)
    const selectors = CORNER_SELECTORS[corner]
    
    // Show circle background
    cell.attr(`${selectors.circle}/opacity`, 1)
    
    // Apply badge icon
    cell.attr(`${selectors.badge}/href`, iconUrl)
    cell.attr(`${selectors.badge}/xlink:href`, iconUrl)
    cell.attr(`${selectors.badge}/opacity`, 1)
  }
  
  remove(cell: dia.Cell, corner: Corner): void {
    if (cell.isLink()) return
    
    const selectors = CORNER_SELECTORS[corner]
    
    // Hide both circle and badge
    cell.attr(`${selectors.circle}/opacity`, 0)
    cell.attr(`${selectors.badge}/opacity`, 0)
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
      'up': 'mdi:check-circle',
      'degraded': 'mdi:alert-circle',
      'down': 'mdi:close-circle'
    }
    const iconName = icons[value] || 'mdi:help-circle'
    const color = this.getColor ? this.getColor(value) : '10b981'
    return `https://api.iconify.design/${iconName}.svg?color=${color.replace('#', '')}`
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
  
  getIcon(_value: string): string {
    return 'https://api.iconify.design/mdi:tag.svg?color=3b82f6'
  }
  
  getColor(_value: string): string {
    return '#3b82f6'
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
 * Owner decorator - shows resource owner
 */
export class OwnerDecorator extends BaseConcernDecorator {
  getValue(cell: dia.Cell): string | null {
    const dna = cell.get('dna') as ResourceDNA | undefined
    return dna?.owner || null
  }
  
  getIcon(_value: string): string {
    return 'https://api.iconify.design/mdi:account.svg?color=ec4899'
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
