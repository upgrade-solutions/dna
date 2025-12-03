/**
 * Tenant/Account configuration
 * Each tenant has their own visual styling and data
 */

import type { ResourceGraph } from './example-resources'
import type { GraphStyles, TenantSettings } from './default-config'

export interface TenantConfig {
  id: string
  name: string
  description?: string
  styles: GraphStyles
  data: ResourceGraph
  settings?: TenantSettings
}

// Re-export types for convenience
export type { GraphStyles, TenantSettings, NodeStyle, LinkStyle } from './default-config'

// Import account-specific tenants
export { dnaPlatformTenant } from './accounts/dna-platform'
export { perfectedClaimsTenant } from './accounts/perfected-claims'
export { inAudioTenant } from './accounts/inaudio'

// Default export is DNA Platform tenant
export { dnaPlatformTenant as default } from './accounts/dna-platform'
