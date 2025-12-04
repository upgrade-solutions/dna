/**
 * DNA Platform Resources and Relationships
 */

import type { ResourceGraph } from '../../example-resources'

export const dnaPlatformResources: ResourceGraph = {
  resources: [
    // DNA Platform (root)
    {
      id: 'dna-platform',
      type: 'web-application',
      name: 'DNA Platform',
      description: 'BizOps-as-Code platform',
      metadata: {
        resourceType: 'web-application',
        language: 'typescript',
        runtime: 'nodejs'
      },
      children: [
        // Frontend Layer
        {
          id: 'frontend-layer',
          type: 'ui-component',
          name: 'Frontend Applications',
          description: 'User-facing web applications',
          metadata: {
            resourceType: 'ui-component',
            language: 'typescript',
            runtime: 'nodejs'
          },
          children: [
            {
              id: 'ui-shell',
              type: 'web-application',
              name: 'UI Shell',
              description: 'Next.js config-driven UI framework',
              metadata: { 
                package: 'ui-shell', 
                tech: 'Next.js 14',
                resourceType: 'web-application',
                language: 'typescript',
                runtime: 'nodejs'
              }
            },
            {
              id: 'product-architect',
              type: 'web-application',
              name: 'Product Architect',
              description: 'DNA framework layer explorer',
              metadata: { 
                package: 'product-architect', 
                tech: 'Next.js 16',
                resourceType: 'web-application',
                language: 'typescript',
                runtime: 'nodejs'
              }
            },
            {
              id: 'dna-studio',
              type: 'web-application',
              name: 'DNA Studio',
              description: 'Voice capture & schema browser',
              metadata: { 
                package: 'dna-studio-mockup', 
                tech: 'Next.js',
                resourceType: 'web-application',
                language: 'typescript',
                runtime: 'nodejs'
              }
            },
            {
              id: 'pa-app-ui',
              type: 'web-application',
              name: 'PA App UI',
              description: 'Product Architect UI',
              metadata: { 
                package: 'pa-app-ui', 
                tech: 'React + Vite',
                resourceType: 'web-application',
                language: 'typescript',
                runtime: 'nodejs'
              }
            },
            {
              id: 'pa-graph',
              type: 'web-application',
              name: 'PA Graph',
              description: 'Graph visualization editor',
              metadata: { 
                package: 'pa-graph', 
                tech: 'React + Vite + JointJS',
                resourceType: 'web-application',
                language: 'typescript',
                runtime: 'nodejs'
              }
            }
          ]
        },
        // Backend Layer
        {
          id: 'backend-layer',
          type: 'api',
          name: 'Backend APIs',
          description: 'Server-side API services',
          metadata: {
            resourceType: 'api',
            language: 'typescript',
            runtime: 'deno'
          },
          children: [
            {
              id: 'api-shell',
              type: 'api',
              name: 'API Shell',
              description: 'OpenAPI-driven runtime API',
              metadata: { 
                package: 'api-shell', 
                tech: 'Deno + Oak',
                resourceType: 'api',
                language: 'typescript',
                runtime: 'deno'
              }
            },
            {
              id: 'pa-app-api',
              type: 'api',
              name: 'PA App API',
              description: 'REST API with Neo4j',
              metadata: { 
                package: 'pa-app-api', 
                tech: 'Deno + Neogma',
                resourceType: 'api',
                language: 'typescript',
                runtime: 'deno'
              }
            }
          ]
        },
        // Services Layer
        {
          id: 'services-layer',
          type: 'service',
          name: 'Core Services',
          description: 'Shared service layer',
          metadata: {
            resourceType: 'service',
            language: 'typescript',
            runtime: 'deno'
          },
          children: [
            {
              id: 'auth-service',
              type: 'service',
              name: 'Auth Service',
              description: 'RBAC/ABAC access control',
              metadata: { 
                location: 'api-shell/middleware',
                resourceType: 'service',
                language: 'typescript',
                runtime: 'deno'
              }
            },
            {
              id: 'schema-validator',
              type: 'service',
              name: 'Schema Validator',
              description: 'Zod-based validation',
              metadata: { 
                location: 'api-shell/core',
                resourceType: 'service',
                language: 'typescript',
                runtime: 'deno'
              }
            }
          ]
        },
        // Data Layer
        {
          id: 'data-layer',
          type: 'database',
          name: 'Data Layer',
          description: 'Databases and schemas',
          metadata: {
            resourceType: 'database',
            runtime: 'postgresql'
          },
          children: [
            {
              id: 'neo4j',
              type: 'database',
              name: 'Neo4j',
              description: 'Graph database for product models',
              metadata: { 
                tech: 'Neo4j + Neogma OGM',
                resourceType: 'database',
                runtime: 'postgresql'
              }
            },
            {
              id: 'dna-schemas',
              type: 'database',
              name: 'DNA Schemas',
              description: 'Core schema library',
              metadata: { 
                package: '@dna/core', 
                tech: 'Zod schemas',
                resourceType: 'file',
                language: 'typescript',
                runtime: 'nodejs'
              }
            }
          ]
        }
      ]
    }
  ],
  relationships: []
}
