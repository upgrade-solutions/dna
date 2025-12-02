/**
 * Example resource-based data for graph visualization
 * Resources represent business/technical entities with relationships between them
 */

export interface Resource {
  id: string
  type: 'web-application' | 'api' | 'database' | 'form-component' | 'service' | 'ui-component'
  name: string
  description?: string
  metadata?: Record<string, unknown>
}

export interface Relationship {
  id: string
  type: 'depends-on' | 'contains' | 'communicates-with' | 'reads-from' | 'writes-to' | 'renders'
  sourceId: string
  targetId: string
  metadata?: Record<string, unknown>
}

export interface ResourceGraph {
  resources: Resource[]
  relationships: Relationship[]
}

// Example 1: Simple web application architecture
export const exampleWebApp: ResourceGraph = {
  resources: [
    {
      id: 'ui-1',
      type: 'web-application',
      name: 'Product Architect UI',
      description: 'Next.js web application'
    },
    {
      id: 'api-1',
      type: 'api',
      name: 'PA App API',
      description: 'Deno REST API server'
    },
    {
      id: 'db-1',
      type: 'database',
      name: 'Neo4j Graph DB',
      description: 'Graph database for product models'
    }
  ],
  relationships: [
    {
      id: 'rel-1',
      type: 'communicates-with',
      sourceId: 'ui-1',
      targetId: 'api-1'
    },
    {
      id: 'rel-2',
      type: 'reads-from',
      sourceId: 'api-1',
      targetId: 'db-1'
    },
    {
      id: 'rel-3',
      type: 'writes-to',
      sourceId: 'api-1',
      targetId: 'db-1'
    }
  ]
}

// Example 2: UI component hierarchy
export const exampleUIComponents: ResourceGraph = {
  resources: [
    {
      id: 'page-1',
      type: 'ui-component',
      name: 'Dashboard Page',
      metadata: { route: '/dashboard' }
    },
    {
      id: 'form-1',
      type: 'form-component',
      name: 'User Registration Form',
      metadata: { fields: ['email', 'password', 'name'] }
    },
    {
      id: 'api-2',
      type: 'api',
      name: 'User API',
      metadata: { endpoint: '/api/users' }
    },
    {
      id: 'db-2',
      type: 'database',
      name: 'User Database',
      metadata: { table: 'users' }
    }
  ],
  relationships: [
    {
      id: 'rel-4',
      type: 'contains',
      sourceId: 'page-1',
      targetId: 'form-1'
    },
    {
      id: 'rel-5',
      type: 'communicates-with',
      sourceId: 'form-1',
      targetId: 'api-2'
    },
    {
      id: 'rel-6',
      type: 'writes-to',
      sourceId: 'api-2',
      targetId: 'db-2'
    }
  ]
}

// Example 3: Complex service architecture
export const exampleServiceArchitecture: ResourceGraph = {
  resources: [
    {
      id: 'web-1',
      type: 'web-application',
      name: 'UI Shell',
      description: 'Config-driven UI framework'
    },
    {
      id: 'api-shell',
      type: 'api',
      name: 'API Shell',
      description: 'OpenAPI-driven runtime'
    },
    {
      id: 'auth-service',
      type: 'service',
      name: 'Auth Service',
      description: 'RBAC/ABAC authentication'
    },
    {
      id: 'data-service',
      type: 'service',
      name: 'Data Service',
      description: 'CRUD operations'
    },
    {
      id: 'neo4j',
      type: 'database',
      name: 'Neo4j',
      description: 'Graph database'
    }
  ],
  relationships: [
    {
      id: 'rel-7',
      type: 'communicates-with',
      sourceId: 'web-1',
      targetId: 'api-shell'
    },
    {
      id: 'rel-8',
      type: 'depends-on',
      sourceId: 'api-shell',
      targetId: 'auth-service'
    },
    {
      id: 'rel-9',
      type: 'depends-on',
      sourceId: 'api-shell',
      targetId: 'data-service'
    },
    {
      id: 'rel-10',
      type: 'reads-from',
      sourceId: 'data-service',
      targetId: 'neo4j'
    },
    {
      id: 'rel-11',
      type: 'writes-to',
      sourceId: 'data-service',
      targetId: 'neo4j'
    }
  ]
}
