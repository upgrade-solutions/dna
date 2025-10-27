import type { Product, Project, VersionHistory } from './data'

export interface VersionChange {
  type: 'major' | 'minor' | 'patch'
  description: string
  changes: string[]
  breakingChanges?: string[]
}

/**
 * Utility functions for managing product and project versions in DNA Studio
 */
export class VersionManager {
  /**
   * Parse a semantic version string
   */
  static parseVersion(version: string): { major: number; minor: number; patch: number } {
    const [major, minor, patch] = version.split('.').map(Number)
    return { major: major || 0, minor: minor || 0, patch: patch || 0 }
  }

  /**
   * Generate the next version based on change type
   */
  static getNextVersion(currentVersion: string, changeType: 'major' | 'minor' | 'patch'): string {
    const { major, minor, patch } = this.parseVersion(currentVersion)
    
    switch (changeType) {
      case 'major':
        return `${major + 1}.0.0`
      case 'minor':
        return `${major}.${minor + 1}.0`
      case 'patch':
        return `${major}.${minor}.${patch + 1}`
      default:
        throw new Error(`Invalid change type: ${changeType}`)
    }
  }

  /**
   * Compare two versions
   */
  static compareVersions(version1: string, version2: string): number {
    const v1 = this.parseVersion(version1)
    const v2 = this.parseVersion(version2)
    
    if (v1.major !== v2.major) return v1.major - v2.major
    if (v1.minor !== v2.minor) return v1.minor - v2.minor
    return v1.patch - v2.patch
  }

  /**
   * Determine the change type between two versions
   */
  static getChangeType(fromVersion: string, toVersion: string): 'major' | 'minor' | 'patch' | null {
    const from = this.parseVersion(fromVersion)
    const to = this.parseVersion(toVersion)
    
    if (to.major > from.major) return 'major'
    if (to.minor > from.minor) return 'minor'
    if (to.patch > from.patch) return 'patch'
    
    return null
  }

  /**
   * Create a new version history entry
   */
  static createVersionEntry(
    version: string,
    description: string,
    changes: string[] = [],
    releaseDate: string = new Date().toISOString().split('T')[0]
  ): VersionHistory {
    return {
      version,
      releaseDate,
      description,
      changes
    }
  }

  /**
   * Update a product to a new version
   */
  static updateProductVersion(
    product: Product,
    versionChange: VersionChange,
    releaseDate?: string
  ): Product {
    const currentVersion = product.version || '1.0.0'
    const newVersion = this.getNextVersion(currentVersion, versionChange.type)
    const date = releaseDate || new Date().toISOString().split('T')[0]

    const newVersionEntry = this.createVersionEntry(
      newVersion,
      versionChange.description,
      versionChange.changes,
      date
    )

    return {
      ...product,
      version: newVersion,
      versionHistory: [
        ...(product.versionHistory || []),
        newVersionEntry
      ]
    }
  }

  /**
   * Update a project to a new version
   */
  static updateProjectVersion(
    project: Project,
    versionChange: VersionChange,
    releaseDate?: string
  ): Project {
    const currentVersion = project.version || '1.0.0'
    const newVersion = this.getNextVersion(currentVersion, versionChange.type)
    const date = releaseDate || new Date().toISOString().split('T')[0]

    const newVersionEntry = this.createVersionEntry(
      newVersion,
      versionChange.description,
      versionChange.changes,
      date
    )

    return {
      ...project,
      version: newVersion,
      versionHistory: [
        ...(project.versionHistory || []),
        newVersionEntry
      ]
    }
  }

  /**
   * Get version badges with appropriate styling
   */
  static getVersionBadgeClass(changeType: 'major' | 'minor' | 'patch' | 'initial'): string {
    switch (changeType) {
      case 'major':
        return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'minor':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'patch':
        return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'initial':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  /**
   * Validate semantic version format
   */
  static isValidVersion(version: string): boolean {
    const semverRegex = /^\d+\.\d+\.\d+$/
    return semverRegex.test(version)
  }

  /**
   * Sort versions in chronological order
   */
  static sortVersionHistory(versionHistory: VersionHistory[]): VersionHistory[] {
    return [...versionHistory].sort((a, b) => {
      return this.compareVersions(a.version, b.version)
    })
  }

  /**
   * Get the latest version from history
   */
  static getLatestVersion(versionHistory: VersionHistory[]): VersionHistory | null {
    if (versionHistory.length === 0) return null
    
    return this.sortVersionHistory(versionHistory).pop() || null
  }

  /**
   * Check if a version is breaking (major version change)
   */
  static isBreakingChange(fromVersion: string, toVersion: string): boolean {
    return this.getChangeType(fromVersion, toVersion) === 'major'
  }
}

// Example usage functions

/**
 * Example: Upgrading Loan Platform from 1.0.0 to 1.1.0
 */
export function exampleProductVersionUpgrade() {
  const loanPlatform: Product = {
    id: "1",
    name: "Loan Platform",
    description: "End-to-end loan origination and servicing platform",
    version: "1.0.0",
    versionHistory: [
      {
        version: "1.0.0",
        releaseDate: "2024-01-15",
        description: "Initial release with core loan processing workflows",
        changes: ["Customer onboarding", "Basic loan application", "Payment processing"]
      }
    ],
    projectCount: 4,
    workflowCount: 5,
    status: "Active",
    workflows: [],
    projects: [],
    organizationId: "org1"
  }

  // Upgrade to version 1.1.0
  const upgradedPlatform = VersionManager.updateProductVersion(loanPlatform, {
    type: 'minor',
    description: 'Enhanced risk assessment and reporting capabilities',
    changes: [
      'Automated risk profiling', 
      'Advanced analytics dashboard', 
      'Collections workflow planning'
    ]
  }, '2024-03-20')

  return upgradedPlatform
}

/**
 * Example: Major version upgrade with breaking changes
 */
export function exampleMajorVersionUpgrade() {
  const bankingCore: Product = {
    id: "2",
    name: "Banking Core",
    description: "Core banking system with account management",
    version: "1.5.2",
    versionHistory: [],
    projectCount: 6,
    workflowCount: 12,
    status: "Active",
    workflows: [],
    projects: [],
    organizationId: "org1"
  }

  // Major upgrade to 2.0.0
  const upgradedCore = VersionManager.updateProductVersion(bankingCore, {
    type: 'major',
    description: 'Complete architecture overhaul with microservices',
    changes: [
      'Microservices architecture',
      'Enhanced security framework',
      'Real-time processing engine',
      'New API contracts'
    ],
    breakingChanges: [
      'Legacy API endpoints deprecated',
      'Database schema changes required',
      'Authentication system updated'
    ]
  }, '2024-01-10')

  return upgradedCore
}