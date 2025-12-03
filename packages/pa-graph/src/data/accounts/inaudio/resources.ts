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
      metadata: { url: 'voices.inaudio.com', tech: 'Next.js' },
      children: [
        // Dashboard Module
        {
          id: 'voices-dashboard-module',
          type: 'module',
          name: 'Dashboard Module',
          description: 'Main dashboard and overview',
          children: [
            {
              id: 'voices-dashboard-page',
              type: 'page',
              name: 'Dashboard Page',
              description: 'Project overview and quick stats',
              metadata: { route: '/dashboard' },
              children: [
                {
                  id: 'voices-dashboard-hero-section',
                  type: 'section',
                  name: 'Hero Section',
                  description: 'Welcome banner and project summary',
                  children: [
                    {
                      id: 'voices-dashboard-greeting-block',
                      type: 'block',
                      name: 'Greeting Block',
                      description: 'Personalized welcome message',
                      metadata: { component: 'GreetingCard' }
                    },
                    {
                      id: 'voices-dashboard-stats-block',
                      type: 'block',
                      name: 'Stats Block',
                      description: 'Active projects and recordings stats',
                      metadata: { component: 'StatsGrid' }
                    }
                  ]
                },
                {
                  id: 'voices-dashboard-projects-section',
                  type: 'section',
                  name: 'Recent Projects Section',
                  description: 'Recently active audiobook projects',
                  children: [
                    {
                      id: 'voices-dashboard-projects-list-block',
                      type: 'block',
                      name: 'Projects List Block',
                      description: 'Grid of recent projects',
                      metadata: { component: 'ProjectsGrid' }
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
          children: [
            {
              id: 'voices-author-page',
              type: 'page',
              name: 'Author Page',
              description: 'Manage authors and publishers',
              metadata: { route: '/authors' },
              children: []
            }
          ]
        }
      ]
    },
  ],
  relationships: [
    
  ]
}
