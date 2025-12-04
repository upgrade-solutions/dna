import { dia } from '@joint/plus'
import type { CategoryConfig, CategoryId, ConcernConfig, ConcernDecorator, Corner, ResourceDNA } from './layer-types'
import {
  StatusDecorator,
  VersionDecorator,
  LifecycleDecorator,
  LanguageDecorator,
  RuntimeDecorator,
  InfrastructureDecorator,
  OwnerDecorator,
  TeamDecorator,
  RACIDecorator,
  DataClassificationDecorator,
  ComplianceDecorator,
  RiskLevelDecorator
} from './concern-decorators'

/**
 * Manages graph overlay badges using a category-concern model.
 * 
 * Categories are fixed to corners:
 * - Process (top-left)
 * - Technology (top-right)
 * - People (bottom-left)
 * - Security (bottom-right)
 * 
 * Each category can display one concern at a time from its available concerns.
 * Categories can be toggled on/off independently.
 */
export class OverlayManager {
  private graph: dia.Graph
  private categories: Map<CategoryId, CategoryConfig>
  private decorators: Map<string, ConcernDecorator>

  constructor(graph: dia.Graph, _paper: dia.Paper) {
    this.graph = graph
    this.categories = new Map()
    this.decorators = new Map()
    this.initializeDecorators()
    this.initializeCategories()
  }

  /**
   * Initialize all concern decorators
   */
  private initializeDecorators(): void {
    // Process decorators
    this.decorators.set('status', new StatusDecorator())
    this.decorators.set('version', new VersionDecorator())
    this.decorators.set('lifecycle', new LifecycleDecorator())
    
    // Technology decorators
    this.decorators.set('language', new LanguageDecorator())
    this.decorators.set('runtime', new RuntimeDecorator())
    this.decorators.set('infrastructure', new InfrastructureDecorator())
    
    // People decorators
    this.decorators.set('owner', new OwnerDecorator())
    this.decorators.set('team', new TeamDecorator())
    this.decorators.set('raci', new RACIDecorator())
    
    // Security decorators
    this.decorators.set('dataClassification', new DataClassificationDecorator())
    this.decorators.set('compliance', new ComplianceDecorator())
    this.decorators.set('riskLevel', new RiskLevelDecorator())
  }

  /**
   * Initialize default categories with their concerns
   */
  private initializeCategories(): void {
    // Process category (top-left)
    this.categories.set('process', {
      id: 'process',
      name: 'Process',
      corner: 'top-left',
      enabled: false,
      activeConcern: null,
      concerns: [
        {
          id: 'status',
          name: 'Status',
          getValue: (dna: ResourceDNA) => dna.status || null
        },
        {
          id: 'version',
          name: 'Version',
          getValue: (dna: ResourceDNA) => dna.version || null
        },
        {
          id: 'lifecycle',
          name: 'Lifecycle',
          getValue: (dna: ResourceDNA) => dna.lifecycle || null
        }
      ]
    })

    // Technology category (top-right)
    this.categories.set('technology', {
      id: 'technology',
      name: 'Technology',
      corner: 'top-right',
      enabled: false,
      activeConcern: null,
      concerns: [
        {
          id: 'language',
          name: 'Language',
          getValue: (dna: ResourceDNA) => dna.language || null
        },
        {
          id: 'runtime',
          name: 'Runtime',
          getValue: (dna: ResourceDNA) => dna.runtime || null
        },
        {
          id: 'infrastructure',
          name: 'Infrastructure',
          getValue: (dna: ResourceDNA) => dna.infrastructure || null
        }
      ]
    })

    // People category (bottom-left)
    this.categories.set('people', {
      id: 'people',
      name: 'People',
      corner: 'bottom-left',
      enabled: false,
      activeConcern: null,
      concerns: [
        {
          id: 'owner',
          name: 'Owner',
          getValue: (dna: ResourceDNA) => dna.owner || null
        },
        {
          id: 'team',
          name: 'Team',
          getValue: (dna: ResourceDNA) => dna.team || null
        },
        {
          id: 'raci',
          name: 'RACI',
          getValue: (dna: ResourceDNA) => dna.raci || null
        }
      ]
    })

    // Security category (bottom-right)
    this.categories.set('security', {
      id: 'security',
      name: 'Security',
      corner: 'bottom-right',
      enabled: false,
      activeConcern: null,
      concerns: [
        {
          id: 'dataClassification',
          name: 'Data Classification',
          getValue: (dna: ResourceDNA) => dna.dataClassification || null
        },
        {
          id: 'compliance',
          name: 'Compliance',
          getValue: (dna: ResourceDNA) => dna.compliance || null
        },
        {
          id: 'riskLevel',
          name: 'Risk Level',
          getValue: (dna: ResourceDNA) => dna.riskLevel || null
        }
      ]
    })
  }

  /**
   * Get all categories
   */
  getAllCategories(): CategoryConfig[] {
    return Array.from(this.categories.values())
  }

  /**
   * Get a specific category
   */
  getCategory(categoryId: CategoryId): CategoryConfig | undefined {
    return this.categories.get(categoryId)
  }

  /**
   * Toggle a category on/off
   */
  toggleCategory(categoryId: CategoryId): boolean {
    const category = this.categories.get(categoryId)
    if (!category) {
      console.warn(`Category ${categoryId} not found`)
      return false
    }

    const newEnabled = !category.enabled
    category.enabled = newEnabled

    if (newEnabled && category.activeConcern) {
      // Apply the active concern decorator
      this.applyDecorator(category.activeConcern, category.corner)
    } else {
      // Remove all badges from this corner
      this.removeDecoratorFromCorner(category.corner)
    }

    return newEnabled
  }

  /**
   * Set a category's active concern
   */
  setActiveConcern(categoryId: CategoryId, concernId: string): void {
    const category = this.categories.get(categoryId)
    if (!category) {
      console.warn(`Category ${categoryId} not found`)
      return
    }

    // Check if concern exists in this category
    const concern = category.concerns.find(c => c.id === concernId)
    if (!concern) {
      console.warn(`Concern ${concernId} not found in category ${categoryId}`)
      return
    }

    // Remove old decorator if there was one
    if (category.activeConcern) {
      this.removeDecoratorFromCorner(category.corner)
    }

    // Set new active concern
    category.activeConcern = concernId

    // Apply new decorator if category is enabled
    if (category.enabled) {
      this.applyDecorator(concernId, category.corner)
    }
  }

  /**
   * Apply a decorator to all cells at a specific corner
   */
  private applyDecorator(concernId: string, corner: Corner): void {
    const decorator = this.decorators.get(concernId)
    if (!decorator) {
      console.warn(`Decorator for concern ${concernId} not found`)
      return
    }

    const cells = this.graph.getCells()
    cells.forEach(cell => {
      if (!cell.isLink()) {
        decorator.apply(cell, corner)
      }
    })
  }

  /**
   * Remove all decorators from a specific corner
   */
  private removeDecoratorFromCorner(corner: Corner): void {
    const cells = this.graph.getCells()
    
    // Create a temporary decorator instance to call remove
    // (all decorators share the same remove implementation)
    const tempDecorator = new StatusDecorator()
    
    cells.forEach(cell => {
      if (!cell.isLink()) {
        tempDecorator.remove(cell, corner)
      }
    })
  }

  /**
   * Count cells with data for a specific concern
   */
  countCellsWithConcern(categoryId: CategoryId, concernId: string): number {
    const category = this.categories.get(categoryId)
    if (!category) return 0

    const concern = category.concerns.find(c => c.id === concernId)
    if (!concern) return 0

    return this.graph.getCells().filter(cell => {
      if (cell.isLink()) return false
      const dna = cell.get('dna') as ResourceDNA | undefined
      if (!dna) return false
      const value = concern.getValue(dna)
      return value !== null && value !== undefined && value !== ''
    }).length
  }

  /**
   * Enable a category and set its first concern as active
   */
  enableCategory(categoryId: CategoryId): void {
    const category = this.categories.get(categoryId)
    if (!category) return

    category.enabled = true

    // If no active concern, set the first one
    if (!category.activeConcern && category.concerns.length > 0) {
      category.activeConcern = category.concerns[0].id
    }

    // Apply decorator
    if (category.activeConcern) {
      this.applyDecorator(category.activeConcern, category.corner)
    }
  }

  /**
   * Disable a category
   */
  disableCategory(categoryId: CategoryId): void {
    const category = this.categories.get(categoryId)
    if (!category) return

    category.enabled = false
    this.removeDecoratorFromCorner(category.corner)
  }

  /**
   * Refresh decorators when new cells are added
   */
  refreshDecorators(): void {
    this.categories.forEach(category => {
      if (category.enabled && category.activeConcern) {
        this.applyDecorator(category.activeConcern, category.corner)
      }
    })
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.categories.clear()
    this.decorators.clear()
  }
}

// Export for backward compatibility
export type { CategoryConfig, ConcernConfig }
