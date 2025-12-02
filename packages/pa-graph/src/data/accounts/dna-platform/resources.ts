/**
 * DNA Platform Resources and Relationships
 */

import type { ResourceGraph } from '../../example-resources'

export const dnaPlatformResources: ResourceGraph = {
  resources: [
    // Frontend Applications
    {
      id: 'ui-shell',
      type: 'web-application',
      name: 'UI Shell',
      description: 'Next.js config-driven UI framework',
      metadata: { package: 'ui-shell', tech: 'Next.js 14' }
    },
    {
      id: 'product-architect',
      type: 'web-application',
      name: 'Product Architect',
      description: 'DNA framework layer explorer',
      metadata: { package: 'product-architect', tech: 'Next.js 16' }
    },
    {
      id: 'dna-studio',
      type: 'web-application',
      name: 'DNA Studio',
      description: 'Voice capture & schema browser',
      metadata: { package: 'dna-studio-mockup', tech: 'Next.js' }
    },
    {
      id: 'pa-app-ui',
      type: 'web-application',
      name: 'PA App UI',
      description: 'Product Architect UI',
      metadata: { package: 'pa-app-ui', tech: 'React + Vite' }
    },
    {
      id: 'pa-graph',
      type: 'web-application',
      name: 'PA Graph',
      description: 'Graph visualization editor',
      metadata: { package: 'pa-graph', tech: 'React + Vite + JointJS' }
    },

    // Backend APIs
    {
      id: 'api-shell',
      type: 'api',
      name: 'API Shell',
      description: 'OpenAPI-driven runtime API',
      metadata: { package: 'api-shell', tech: 'Deno + Oak' }
    },
    {
      id: 'pa-app-api',
      type: 'api',
      name: 'PA App API',
      description: 'REST API with Neo4j',
      metadata: { package: 'pa-app-api', tech: 'Deno + Neogma' }
    },

    // Core Services
    {
      id: 'auth-service',
      type: 'service',
      name: 'Auth Service',
      description: 'RBAC/ABAC access control',
      metadata: { location: 'api-shell/middleware' }
    },
    {
      id: 'schema-validator',
      type: 'service',
      name: 'Schema Validator',
      description: 'Zod-based validation',
      metadata: { location: 'api-shell/core' }
    },

    // Data Layer
    {
      id: 'neo4j',
      type: 'database',
      name: 'Neo4j',
      description: 'Graph database for product models',
      metadata: { tech: 'Neo4j + Neogma OGM' }
    },
    {
      id: 'dna-schemas',
      type: 'database',
      name: 'DNA Schemas',
      description: 'Core schema library',
      metadata: { package: '@dna/core', tech: 'Zod schemas' }
    }
  ],
  relationships: [
    // UI Shell connections
    {
      id: 'rel-1',
      type: 'communicates-with',
      sourceId: 'ui-shell',
      targetId: 'api-shell'
    },
    {
      id: 'rel-2',
      type: 'depends-on',
      sourceId: 'ui-shell',
      targetId: 'dna-schemas'
    },

    // Product Architect connections
    {
      id: 'rel-3',
      type: 'communicates-with',
      sourceId: 'product-architect',
      targetId: 'pa-app-api'
    },
    {
      id: 'rel-4',
      type: 'depends-on',
      sourceId: 'product-architect',
      targetId: 'dna-schemas'
    },

    // DNA Studio connections
    {
      id: 'rel-5',
      type: 'communicates-with',
      sourceId: 'dna-studio',
      targetId: 'api-shell'
    },
    {
      id: 'rel-6',
      type: 'depends-on',
      sourceId: 'dna-studio',
      targetId: 'dna-schemas'
    },

    // PA App UI connections
    {
      id: 'rel-7',
      type: 'communicates-with',
      sourceId: 'pa-app-ui',
      targetId: 'pa-app-api'
    },

    // PA Graph connections
    {
      id: 'rel-8',
      type: 'communicates-with',
      sourceId: 'pa-graph',
      targetId: 'pa-app-api'
    },

    // API Shell architecture
    {
      id: 'rel-9',
      type: 'depends-on',
      sourceId: 'api-shell',
      targetId: 'auth-service'
    },
    {
      id: 'rel-10',
      type: 'depends-on',
      sourceId: 'api-shell',
      targetId: 'schema-validator'
    },
    {
      id: 'rel-11',
      type: 'depends-on',
      sourceId: 'api-shell',
      targetId: 'dna-schemas'
    },

    // PA App API architecture
    {
      id: 'rel-12',
      type: 'reads-from',
      sourceId: 'pa-app-api',
      targetId: 'neo4j'
    },
    {
      id: 'rel-13',
      type: 'writes-to',
      sourceId: 'pa-app-api',
      targetId: 'neo4j'
    },
    {
      id: 'rel-14',
      type: 'depends-on',
      sourceId: 'pa-app-api',
      targetId: 'dna-schemas'
    },

    // Service dependencies
    {
      id: 'rel-15',
      type: 'depends-on',
      sourceId: 'auth-service',
      targetId: 'dna-schemas'
    },
    {
      id: 'rel-16',
      type: 'depends-on',
      sourceId: 'schema-validator',
      targetId: 'dna-schemas'
    }
  ]
}
