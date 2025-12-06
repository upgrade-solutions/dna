/**
 * inAudio Platform Resources
 * Audiobook distribution system architecture
 */

import type { ResourceGraph } from '../../example-resources'

export const inAudioResources: ResourceGraph = {
  resources: [
    {
      id: 'voices-app',
      type: 'web-application',
      name: 'Voices',
      description: 'Narrator and publisher management application',
      metadata: { 
        url: 'voices.inaudio.com', 
        tech: 'Next.js',
        resourceType: 'web-application',
        language: 'typescript',
        runtime: 'nodejs',
        status: 'up',
        version: '1.0.0',
        lifecycle: 'run',
        owner: 'INaudio Product Team',
        avatarUrl: 'https://i.pravatar.cc/150?img=42',
        team: 'INaudio Engineering',
        raci: 'accountable',
        infrastructure: 'service',
        dataClassification: 'internal',
        compliance: ['gdpr'],
        riskLevel: 'medium'
      },
      children: [
        // Dashboard Module
        {
          id: 'voices-dashboard-module',
          type: 'module',
          name: 'Dashboard Module',
          description: 'Main dashboard and overview',
          metadata: {
            resourceType: 'module',
            language: 'typescript',
            runtime: 'nodejs',
            owner: 'Frontend Team',
            team: 'INaudio Engineering',
            raci: 'responsible'
          },
          children: [
            {
              id: 'voices-dashboard-page',
              type: 'page',
              name: 'Dashboard Page',
              description: 'Project overview and quick stats',
              metadata: { 
                route: '/dashboard',
                resourceType: 'page',
                language: 'typescript',
                runtime: 'nodejs'
              },
              children: [
                {
                  id: 'voices-dashboard-hero-section',
                  type: 'section',
                  name: 'Hero Section',
                  description: 'Welcome banner and project summary',
                  metadata: {
                    resourceType: 'section'
                  },
                  children: [
                    {
                      id: 'voices-dashboard-greeting-block',
                      type: 'block',
                      name: 'Greeting Block',
                      description: 'Personalized welcome message',
                      metadata: { 
                        component: 'GreetingCard',
                        resourceType: 'ui-component'
                      }
                    },
                    {
                      id: 'voices-dashboard-stats-block',
                      type: 'block',
                      name: 'Stats Block',
                      description: 'Active projects and recordings stats',
                      metadata: { 
                        component: 'StatsGrid',
                        resourceType: 'ui-component'
                      }
                    }
                  ]
                },
                {
                  id: 'voices-dashboard-projects-section',
                  type: 'section',
                  name: 'Recent Projects Section',
                  description: 'Recently active audiobook projects',
                  metadata: {
                    resourceType: 'section'
                  },
                  children: [
                    {
                      id: 'voices-dashboard-projects-list-block',
                      type: 'block',
                      name: 'Projects List Block',
                      description: 'Grid of recent projects',
                      metadata: { 
                        component: 'ProjectsGrid',
                        resourceType: 'ui-component'
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        // Author Module
        {
          id: 'voices-author-module',
          type: 'module',
          name: 'Author Module',
          description: 'Author and publisher management',
          metadata: {
            resourceType: 'module',
            language: 'typescript',
            runtime: 'nodejs',
            owner: 'Content Team',
            team: 'INaudio Engineering',
            raci: 'responsible'
          },
          children: [
            {
              id: 'voices-author-list-page',
              type: 'page',
              name: 'Author List Page',
              description: 'Browse and search all authors',
              metadata: { 
                route: '/authors',
                resourceType: 'page',
                language: 'typescript',
                runtime: 'nodejs',
                status: 'up',
                version: '1.2.0',
                lifecycle: 'run',
                owner: 'Content Team',
                team: 'INaudio Engineering',
                raci: 'responsible',
                dataClassification: 'internal'
              },
              children: [
                {
                  id: 'voices-author-list-header-section',
                  type: 'section',
                  name: 'Header Section',
                  description: 'Page title and search controls',
                  metadata: {
                    resourceType: 'section',
                    language: 'typescript',
                    runtime: 'nodejs'
                  },
                  children: [
                    {
                      id: 'voices-author-search-block',
                      type: 'block',
                      name: 'Author Search Block',
                      description: 'Search and filter authors',
                      metadata: { 
                        component: 'AuthorSearchBar',
                        resourceType: 'ui-component',
                        language: 'typescript',
                        runtime: 'nodejs',
                        status: 'up',
                        version: '1.0.0'
                      }
                    }
                  ]
                },
                {
                  id: 'voices-author-list-content-section',
                  type: 'section',
                  name: 'Author List Section',
                  description: 'Paginated list of authors',
                  metadata: {
                    resourceType: 'section',
                    language: 'typescript',
                    runtime: 'nodejs'
                  },
                  children: [
                    {
                      id: 'voices-author-table-block',
                      type: 'block',
                      name: 'Author Table Block',
                      description: 'Sortable author data table',
                      metadata: { 
                        component: 'AuthorTable',
                        resourceType: 'ui-component',
                        language: 'typescript',
                        runtime: 'nodejs',
                        status: 'up',
                        version: '1.1.0',
                        dataClassification: 'internal'
                      }
                    }
                  ]
                }
              ]
            },
            {
              id: 'voices-author-detail-page',
              type: 'page',
              name: 'Author Detail Page',
              description: 'View and edit individual author details',
              metadata: { 
                route: '/authors/:id',
                resourceType: 'page',
                language: 'typescript',
                runtime: 'nodejs',
                status: 'up',
                version: '1.1.5',
                lifecycle: 'run',
                owner: 'Content Team',
                team: 'INaudio Engineering',
                raci: 'responsible',
                dataClassification: 'pii',
                riskLevel: 'medium'
              },
              children: [
                {
                  id: 'voices-author-detail-header-section',
                  type: 'section',
                  name: 'Author Header Section',
                  description: 'Author name and profile image',
                  metadata: {
                    resourceType: 'section',
                    language: 'typescript',
                    runtime: 'nodejs'
                  },
                  children: [
                    {
                      id: 'voices-author-profile-block',
                      type: 'block',
                      name: 'Author Profile Block',
                      description: 'Author bio and contact info',
                      metadata: { 
                        component: 'AuthorProfileCard',
                        resourceType: 'ui-component',
                        language: 'typescript',
                        runtime: 'nodejs',
                        status: 'up',
                        version: '1.0.2',
                        dataClassification: 'pii'
                      }
                    }
                  ]
                },
                {
                  id: 'voices-author-books-section',
                  type: 'section',
                  name: 'Author Books Section',
                  description: 'Books by this author',
                  metadata: {
                    resourceType: 'section',
                    language: 'typescript',
                    runtime: 'nodejs'
                  },
                  children: [
                    {
                      id: 'voices-author-books-list-block',
                      type: 'block',
                      name: 'Books List Block',
                      description: 'Grid of books by author',
                      metadata: { 
                        component: 'AuthorBooksGrid',
                        resourceType: 'ui-component',
                        language: 'typescript',
                        runtime: 'nodejs',
                        status: 'up',
                        version: '1.0.0'
                      }
                    }
                  ]
                }
              ]
            },
            {
              id: 'voices-author-create-page',
              type: 'page',
              name: 'Create Author Page',
              description: 'Add a new author to the system',
              metadata: { 
                route: '/authors/new',
                resourceType: 'page',
                language: 'typescript',
                runtime: 'nodejs',
                status: 'up',
                version: '1.0.0',
                lifecycle: 'run',
                owner: 'Content Team',
                team: 'INaudio Engineering',
                raci: 'responsible',
                dataClassification: 'pii',
                riskLevel: 'medium'
              },
              children: [
                {
                  id: 'voices-author-create-form-section',
                  type: 'section',
                  name: 'Author Form Section',
                  description: 'Author creation form',
                  metadata: {
                    resourceType: 'section',
                    language: 'typescript',
                    runtime: 'nodejs'
                  },
                  children: [
                    {
                      id: 'voices-author-form-block',
                      type: 'block',
                      name: 'Author Form Block',
                      description: 'Form fields for author details',
                      metadata: { 
                        component: 'AuthorForm',
                        resourceType: 'ui-component',
                        language: 'typescript',
                        runtime: 'nodejs',
                        status: 'up',
                        version: '1.2.0',
                        dataClassification: 'pii'
                      }
                    }
                  ]
                }
              ]
            },
            {
              id: 'voices-publisher-list-page',
              type: 'page',
              name: 'Publisher List Page',
              description: 'Browse and manage publishers',
              metadata: { 
                route: '/publishers',
                resourceType: 'page',
                language: 'typescript',
                runtime: 'nodejs',
                status: 'up',
                version: '1.0.0',
                lifecycle: 'run',
                owner: 'Content Team',
                team: 'INaudio Engineering',
                raci: 'responsible',
                dataClassification: 'internal'
              },
              children: [
                {
                  id: 'voices-publisher-list-section',
                  type: 'section',
                  name: 'Publisher List Section',
                  description: 'Grid of publisher cards',
                  metadata: {
                    resourceType: 'section',
                    language: 'typescript',
                    runtime: 'nodejs'
                  },
                  children: [
                    {
                      id: 'voices-publisher-grid-block',
                      type: 'block',
                      name: 'Publisher Grid Block',
                      description: 'Cards displaying publisher info',
                      metadata: { 
                        component: 'PublisherGrid',
                        resourceType: 'ui-component',
                        language: 'typescript',
                        runtime: 'nodejs',
                        status: 'up',
                        version: '1.0.0'
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
  ],
  relationships: [
    
  ]
}
