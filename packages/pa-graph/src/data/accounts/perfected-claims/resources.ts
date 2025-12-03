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
      metadata: { url: 'perfectedclaims.com/portal', tech: 'Next.js' },
      children: [
        // Dashboard Module
        {
          id: 'dashboard-module',
          type: 'module',
          name: 'Dashboard Module',
          description: 'Main dashboard and case overview',
          children: [
            {
              id: 'dashboard-page',
              type: 'page',
              name: 'Dashboard Page',
              description: 'Case status overview and quick actions',
              metadata: { route: '/dashboard' },
              children: [
                {
                  id: 'dashboard-hero-section',
                  type: 'section',
                  name: 'Hero Section',
                  description: 'Welcome banner and case summary',
                  children: [
                    {
                      id: 'dashboard-hero-greeting-block',
                      type: 'block',
                      name: 'Greeting Block',
                      description: 'Personalized welcome message',
                      metadata: { component: 'GreetingCard' }
                    },
                    {
                      id: 'dashboard-hero-stats-block',
                      type: 'block',
                      name: 'Stats Block',
                      description: 'Case statistics overview',
                      metadata: { component: 'StatsGrid' }
                    }
                  ]
                },
                {
                  id: 'dashboard-actions-section',
                  type: 'section',
                  name: 'Quick Actions Section',
                  description: 'Common user actions',
                  children: [
                    {
                      id: 'dashboard-actions-cta-block',
                      type: 'block',
                      name: 'CTA Block',
                      description: 'Primary action buttons',
                      metadata: { component: 'CTAButtons' }
                    }
                  ]
                }
              ]
            }
          ]
        },
        // Intake Module
        {
          id: 'intake-module',
          type: 'module',
          name: 'Intake Module',
          description: 'Claimant registration and questionnaire',
          children: [
            {
              id: 'intake-form-page',
              type: 'page',
              name: 'Intake Form Page',
              description: 'Multi-step claimant intake form',
              metadata: { route: '/intake' },
              children: [
                {
                  id: 'intake-personal-section',
                  type: 'section',
                  name: 'Personal Information Section',
                  description: 'Claimant personal details',
                  metadata: { step: 1 },
                  children: [
                    {
                      id: 'intake-personal-name-block',
                      type: 'block',
                      name: 'Name Fields Block',
                      description: 'First, middle, last name inputs',
                      metadata: { component: 'NameInputGroup' }
                    },
                    {
                      id: 'intake-personal-contact-block',
                      type: 'block',
                      name: 'Contact Fields Block',
                      description: 'Email and phone inputs',
                      metadata: { component: 'ContactInputGroup' }
                    }
                  ]
                },
                {
                  id: 'intake-medical-section',
                  type: 'section',
                  name: 'Medical History Section',
                  description: 'Injury and treatment details',
                  metadata: { step: 2 },
                  children: [
                    {
                      id: 'intake-medical-injury-block',
                      type: 'block',
                      name: 'Injury Details Block',
                      description: 'Description of injury and symptoms',
                      metadata: { component: 'InjuryForm' }
                    },
                    {
                      id: 'intake-medical-timeline-block',
                      type: 'block',
                      name: 'Timeline Block',
                      description: 'Treatment and exposure timeline',
                      metadata: { component: 'TimelineBuilder' }
                    }
                  ]
                },
                {
                  id: 'intake-documents-section',
                  type: 'section',
                  name: 'Document Upload Section',
                  description: 'Upload supporting documents',
                  metadata: { step: 3 },
                  children: [
                    {
                      id: 'intake-documents-uploader-block',
                      type: 'block',
                      name: 'File Uploader Block',
                      description: 'Drag-and-drop file upload',
                      metadata: { component: 'DocumentUploader' }
                    }
                  ]
                }
              ]
            }
          ]
        },
        // Cases Module
        {
          id: 'cases-module',
          type: 'module',
          name: 'Cases Module',
          description: 'Case management and tracking',
          children: [
            {
              id: 'cases-list-page',
              type: 'page',
              name: 'Cases List Page',
              description: 'View all cases',
              metadata: { route: '/cases' },
              children: [
                {
                  id: 'cases-list-filters-section',
                  type: 'section',
                  name: 'Filters Section',
                  description: 'Search and filter controls',
                  children: [
                    {
                      id: 'cases-list-search-block',
                      type: 'block',
                      name: 'Search Block',
                      description: 'Case search input',
                      metadata: { component: 'SearchBar' }
                    },
                    {
                      id: 'cases-list-filter-block',
                      type: 'block',
                      name: 'Filter Block',
                      description: 'Status and date filters',
                      metadata: { component: 'FilterDropdowns' }
                    }
                  ]
                },
                {
                  id: 'cases-list-table-section',
                  type: 'section',
                  name: 'Cases Table Section',
                  description: 'Paginated case list',
                  children: [
                    {
                      id: 'cases-list-table-block',
                      type: 'block',
                      name: 'Data Table Block',
                      description: 'Interactive cases table',
                      metadata: { component: 'CasesDataTable' }
                    }
                  ]
                }
              ]
            },
            {
              id: 'case-detail-page',
              type: 'page',
              name: 'Case Detail Page',
              description: 'Individual case details',
              metadata: { route: '/cases/:id' },
              children: [
                {
                  id: 'case-detail-header-section',
                  type: 'section',
                  name: 'Case Header Section',
                  description: 'Case title and status',
                  children: [
                    {
                      id: 'case-detail-header-title-block',
                      type: 'block',
                      name: 'Title Block',
                      description: 'Case number and title',
                      metadata: { component: 'CaseHeader' }
                    },
                    {
                      id: 'case-detail-header-badge-block',
                      type: 'block',
                      name: 'Status Badge Block',
                      description: 'Current case status indicator',
                      metadata: { component: 'StatusBadge' }
                    }
                  ]
                },
                {
                  id: 'case-detail-timeline-section',
                  type: 'section',
                  name: 'Timeline Section',
                  description: 'Case activity timeline',
                  children: [
                    {
                      id: 'case-detail-timeline-events-block',
                      type: 'block',
                      name: 'Events Block',
                      description: 'Chronological case events',
                      metadata: { component: 'EventTimeline' }
                    }
                  ]
                },
                {
                  id: 'case-detail-documents-section',
                  type: 'section',
                  name: 'Documents Section',
                  description: 'Case documents and files',
                  children: [
                    {
                      id: 'case-detail-documents-list-block',
                      type: 'block',
                      name: 'Documents List Block',
                      description: 'Downloadable case documents',
                      metadata: { component: 'DocumentsList' }
                    }
                  ]
                }
              ]
            }
          ]
        },
        // Communications Module
        {
          id: 'communications-module',
          type: 'module',
          name: 'Communications Module',
          description: 'Messages and notifications',
          children: [
            {
              id: 'messages-page',
              type: 'page',
              name: 'Messages Page',
              description: 'Secure messaging with legal team',
              metadata: { route: '/messages' },
              children: [
                {
                  id: 'messages-inbox-section',
                  type: 'section',
                  name: 'Inbox Section',
                  description: 'Message list',
                  children: [
                    {
                      id: 'messages-inbox-list-block',
                      type: 'block',
                      name: 'Message List Block',
                      description: 'Thread list with previews',
                      metadata: { component: 'MessageThreadList' }
                    }
                  ]
                },
                {
                  id: 'messages-conversation-section',
                  type: 'section',
                  name: 'Conversation Section',
                  description: 'Active message thread',
                  children: [
                    {
                      id: 'messages-conversation-thread-block',
                      type: 'block',
                      name: 'Thread Block',
                      description: 'Message history',
                      metadata: { component: 'MessageThread' }
                    },
                    {
                      id: 'messages-conversation-compose-block',
                      type: 'block',
                      name: 'Compose Block',
                      description: 'Reply input and send button',
                      metadata: { component: 'MessageComposer' }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
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
    // API relationships
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
