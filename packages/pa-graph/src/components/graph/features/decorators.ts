import { dia } from '@joint/plus'

/**
 * Base interface for cell decorators
 * Decorators apply visual treatments to cells without modifying core data
 */
export interface CellDecorator {
  apply(cell: dia.Cell): void
  remove(cell: dia.Cell): void
}

/**
 * Language badge decorator - shows language icon in top-right corner
 */
export class LanguageBadgeDecorator implements CellDecorator {
  apply(cell: dia.Cell): void {
    if (cell.isLink()) return
    
    const dna = cell.get('dna')
    const language = dna?.language
    
    if (!language) {
      console.warn('[LanguageBadgeDecorator] No language found for cell:', cell.id)
      return
    }
    
    // Get language icon URL
    const iconUrl = this.getLanguageIcon(language)
    
    // Apply badge attributes  
    // Try both href formats to ensure compatibility
    cell.attr('languageBadge/href', iconUrl)
    cell.attr('languageBadge/xlink:href', iconUrl)
    cell.attr('languageBadge/opacity', 1)
  }
  
  remove(cell: dia.Cell): void {
    if (cell.isLink()) return
    
    // Hide badge by setting opacity to 0
    cell.attr('languageBadge/opacity', 0)
  }
  
  private getLanguageIcon(language: string): string {
    // Map language names to iconify icons (monochrome)
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
 * Runtime badge decorator - shows runtime icon in bottom-right corner
 */
export class RuntimeBadgeDecorator implements CellDecorator {
  apply(cell: dia.Cell): void {
    if (cell.isLink()) return
    
    const dna = cell.get('dna')
    const runtime = dna?.runtime
    
    if (!runtime) {
      console.warn('[RuntimeBadgeDecorator] No runtime found for cell:', cell.id, 'DNA:', dna)
      return
    }
    
    // Get runtime icon URL
    const iconUrl = this.getRuntimeIcon(runtime)
    
    // Apply badge attributes
    // Try both href formats to ensure compatibility
    cell.attr('runtimeBadge/href', iconUrl)
    cell.attr('runtimeBadge/xlink:href', iconUrl)
    cell.attr('runtimeBadge/opacity', 1)
  }
  
  remove(cell: dia.Cell): void {
    if (cell.isLink()) return
    
    // Hide badge by setting opacity to 0
    cell.attr('runtimeBadge/opacity', 0)
  }
  
  private getRuntimeIcon(runtime: string): string {
    // Map runtime names to iconify icons (monochrome)
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
