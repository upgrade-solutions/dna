/**
 * Perfected Claims Platform Resources
 * Mass tort case management system architecture
 */

import type { ResourceGraph } from '../../example-resources'

export const perfectedClaimsResources: ResourceGraph = {
  resources: [
    {
      id: 'client-portal',
      type: 'web-application',
      name: 'Client Portal',
      description: 'Claimant intake and case tracking',
      metadata: { url: 'perfectedclaims.com/portal', tech: 'Next.js' }
    },
    {
      id: 'case-api',
      type: 'api',
      name: 'Case API',
      description: 'Case management API',
      metadata: { tech: 'Node.js + Express' }
    },
    {
      id: 'case-database',
      type: 'database',
      name: 'Case DB',
      description: 'PostgreSQL database',
      metadata: { tech: 'PostgreSQL' }
    }
  ],
  relationships: [
    {
      id: 'rel-1',
      type: 'communicates-with',
      sourceId: 'client-portal',
      targetId: 'case-api',
      label: 'calls'
    },
    {
      id: 'rel-2',
      type: 'writes-to',
      sourceId: 'case-api',
      targetId: 'case-database',
      label: 'persists'
    }
  ]
}
