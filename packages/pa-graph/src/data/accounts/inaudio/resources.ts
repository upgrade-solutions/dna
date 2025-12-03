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
        // Narrators Module
        {
          id: 'voices-narrators-module',
          type: 'module',
          name: 'Narrators Module',
          description: 'Voice talent management',
          children: [
            {
              id: 'voices-narrators-list-page',
              type: 'page',
              name: 'Narrators List Page',
              description: 'Browse and manage voice talent',
              metadata: { route: '/narrators' },
              children: [
                {
                  id: 'voices-narrators-filters-section',
                  type: 'section',
                  name: 'Filters Section',
                  description: 'Search and filter narrators',
                  children: [
                    {
                      id: 'voices-narrators-search-block',
                      type: 'block',
                      name: 'Search Block',
                      description: 'Narrator search input',
                      metadata: { component: 'SearchBar' }
                    },
                    {
                      id: 'voices-narrators-filter-block',
                      type: 'block',
                      name: 'Filter Block',
                      description: 'Genre and availability filters',
                      metadata: { component: 'FilterDropdowns' }
                    }
                  ]
                },
                {
                  id: 'voices-narrators-grid-section',
                  type: 'section',
                  name: 'Narrators Grid Section',
                  description: 'Visual narrator cards',
                  children: [
                    {
                      id: 'voices-narrators-cards-block',
                      type: 'block',
                      name: 'Narrator Cards Block',
                      description: 'Grid of narrator profiles',
                      metadata: { component: 'NarratorCardsGrid' }
                    }
                  ]
                }
              ]
            },
            {
              id: 'voices-narrator-profile-page',
              type: 'page',
              name: 'Narrator Profile Page',
              description: 'Individual narrator details',
              metadata: { route: '/narrators/:id' },
              children: [
                {
                  id: 'voices-narrator-header-section',
                  type: 'section',
                  name: 'Profile Header Section',
                  description: 'Narrator name and bio',
                  children: [
                    {
                      id: 'voices-narrator-header-avatar-block',
                      type: 'block',
                      name: 'Avatar Block',
                      description: 'Profile photo and basic info',
                      metadata: { component: 'ProfileAvatar' }
                    },
                    {
                      id: 'voices-narrator-header-bio-block',
                      type: 'block',
                      name: 'Bio Block',
                      description: 'Narrator biography and experience',
                      metadata: { component: 'BioCard' }
                    }
                  ]
                },
                {
                  id: 'voices-narrator-samples-section',
                  type: 'section',
                  name: 'Voice Samples Section',
                  description: 'Audio demo reels',
                  children: [
                    {
                      id: 'voices-narrator-samples-player-block',
                      type: 'block',
                      name: 'Audio Player Block',
                      description: 'Embedded audio samples',
                      metadata: { component: 'AudioSamplesPlayer' }
                    }
                  ]
                },
                {
                  id: 'voices-narrator-projects-section',
                  type: 'section',
                  name: 'Projects Section',
                  description: 'Past and current projects',
                  children: [
                    {
                      id: 'voices-narrator-projects-list-block',
                      type: 'block',
                      name: 'Projects List Block',
                      description: 'Table of projects',
                      metadata: { component: 'ProjectsTable' }
                    }
                  ]
                }
              ]
            }
          ]
        },
        // Projects Module
        {
          id: 'voices-projects-module',
          type: 'module',
          name: 'Projects Module',
          description: 'Audiobook project management',
          children: [
            {
              id: 'voices-projects-list-page',
              type: 'page',
              name: 'Projects List Page',
              description: 'All audiobook projects',
              metadata: { route: '/projects' },
              children: [
                {
                  id: 'voices-projects-toolbar-section',
                  type: 'section',
                  name: 'Toolbar Section',
                  description: 'Search and create actions',
                  children: [
                    {
                      id: 'voices-projects-search-block',
                      type: 'block',
                      name: 'Search Block',
                      description: 'Project search',
                      metadata: { component: 'SearchBar' }
                    },
                    {
                      id: 'voices-projects-create-block',
                      type: 'block',
                      name: 'Create Button Block',
                      description: 'New project button',
                      metadata: { component: 'CreateButton' }
                    }
                  ]
                },
                {
                  id: 'voices-projects-table-section',
                  type: 'section',
                  name: 'Projects Table Section',
                  description: 'Project list with status',
                  children: [
                    {
                      id: 'voices-projects-table-block',
                      type: 'block',
                      name: 'Data Table Block',
                      description: 'Interactive projects table',
                      metadata: { component: 'ProjectsDataTable' }
                    }
                  ]
                }
              ]
            },
            {
              id: 'voices-project-detail-page',
              type: 'page',
              name: 'Project Detail Page',
              description: 'Individual project workspace',
              metadata: { route: '/projects/:id' },
              children: [
                {
                  id: 'voices-project-header-section',
                  type: 'section',
                  name: 'Project Header Section',
                  description: 'Title and status',
                  children: [
                    {
                      id: 'voices-project-title-block',
                      type: 'block',
                      name: 'Title Block',
                      description: 'Book title and author',
                      metadata: { component: 'ProjectHeader' }
                    },
                    {
                      id: 'voices-project-status-block',
                      type: 'block',
                      name: 'Status Block',
                      description: 'Production status indicator',
                      metadata: { component: 'StatusBadge' }
                    }
                  ]
                },
                {
                  id: 'voices-project-recordings-section',
                  type: 'section',
                  name: 'Recordings Section',
                  description: 'Chapter recordings list',
                  children: [
                    {
                      id: 'voices-project-recordings-list-block',
                      type: 'block',
                      name: 'Recordings List Block',
                      description: 'Chapter-by-chapter audio files',
                      metadata: { component: 'RecordingsList' }
                    },
                    {
                      id: 'voices-project-recordings-upload-block',
                      type: 'block',
                      name: 'Upload Block',
                      description: 'Audio file uploader',
                      metadata: { component: 'AudioUploader' }
                    }
                  ]
                },
                {
                  id: 'voices-project-metadata-section',
                  type: 'section',
                  name: 'Metadata Section',
                  description: 'Project details and settings',
                  children: [
                    {
                      id: 'voices-project-metadata-form-block',
                      type: 'block',
                      name: 'Metadata Form Block',
                      description: 'Editable project metadata',
                      metadata: { component: 'MetadataForm' }
                    }
                  ]
                }
              ]
            }
          ]
        },
        // Publishers Module
        {
          id: 'voices-publishers-module',
          type: 'module',
          name: 'Publishers Module',
          description: 'Publisher account management',
          children: [
            {
              id: 'voices-publishers-list-page',
              type: 'page',
              name: 'Publishers List Page',
              description: 'All publisher accounts',
              metadata: { route: '/publishers' },
              children: [
                {
                  id: 'voices-publishers-table-section',
                  type: 'section',
                  name: 'Publishers Table Section',
                  description: 'Publisher directory',
                  children: [
                    {
                      id: 'voices-publishers-table-block',
                      type: 'block',
                      name: 'Publishers Table Block',
                      description: 'Sortable publishers list',
                      metadata: { component: 'PublishersTable' }
                    }
                  ]
                }
              ]
            },
            {
              id: 'voices-publisher-detail-page',
              type: 'page',
              name: 'Publisher Detail Page',
              description: 'Publisher account details',
              metadata: { route: '/publishers/:id' },
              children: [
                {
                  id: 'voices-publisher-info-section',
                  type: 'section',
                  name: 'Publisher Info Section',
                  description: 'Account information',
                  children: [
                    {
                      id: 'voices-publisher-info-card-block',
                      type: 'block',
                      name: 'Info Card Block',
                      description: 'Publisher details card',
                      metadata: { component: 'PublisherInfoCard' }
                    }
                  ]
                },
                {
                  id: 'voices-publisher-catalog-section',
                  type: 'section',
                  name: 'Catalog Section',
                  description: 'Publisher\'s audiobook catalog',
                  children: [
                    {
                      id: 'voices-publisher-catalog-grid-block',
                      type: 'block',
                      name: 'Catalog Grid Block',
                      description: 'Published audiobooks',
                      metadata: { component: 'CatalogGrid' }
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
      id: 'passport-app',
      type: 'web-application',
      name: 'Passport',
      description: 'Distribution and delivery management application',
      metadata: { url: 'passport.inaudio.com', tech: 'Next.js' },
      children: [
        // Dashboard Module
        {
          id: 'passport-dashboard-module',
          type: 'module',
          name: 'Dashboard Module',
          description: 'Distribution dashboard',
          children: [
            {
              id: 'passport-dashboard-page',
              type: 'page',
              name: 'Dashboard Page',
              description: 'Distribution overview',
              metadata: { route: '/dashboard' },
              children: [
                {
                  id: 'passport-dashboard-hero-section',
                  type: 'section',
                  name: 'Hero Section',
                  description: 'Distribution metrics',
                  children: [
                    {
                      id: 'passport-dashboard-metrics-block',
                      type: 'block',
                      name: 'Metrics Block',
                      description: 'Distribution KPIs',
                      metadata: { component: 'DistributionMetrics' }
                    }
                  ]
                },
                {
                  id: 'passport-dashboard-activity-section',
                  type: 'section',
                  name: 'Activity Section',
                  description: 'Recent distribution activity',
                  children: [
                    {
                      id: 'passport-dashboard-activity-feed-block',
                      type: 'block',
                      name: 'Activity Feed Block',
                      description: 'Recent delivery events',
                      metadata: { component: 'ActivityFeed' }
                    }
                  ]
                }
              ]
            }
          ]
        },
        // Distribution Module
        {
          id: 'passport-distribution-module',
          type: 'module',
          name: 'Distribution Module',
          description: 'Manage audiobook distribution',
          children: [
            {
              id: 'passport-releases-page',
              type: 'page',
              name: 'Releases Page',
              description: 'Audiobook releases management',
              metadata: { route: '/releases' },
              children: [
                {
                  id: 'passport-releases-filters-section',
                  type: 'section',
                  name: 'Filters Section',
                  description: 'Release filters and search',
                  children: [
                    {
                      id: 'passport-releases-search-block',
                      type: 'block',
                      name: 'Search Block',
                      description: 'Release search',
                      metadata: { component: 'SearchBar' }
                    },
                    {
                      id: 'passport-releases-filter-block',
                      type: 'block',
                      name: 'Filter Block',
                      description: 'Platform and status filters',
                      metadata: { component: 'ReleaseFilters' }
                    }
                  ]
                },
                {
                  id: 'passport-releases-table-section',
                  type: 'section',
                  name: 'Releases Table Section',
                  description: 'Distribution releases',
                  children: [
                    {
                      id: 'passport-releases-table-block',
                      type: 'block',
                      name: 'Releases Table Block',
                      description: 'Interactive releases table',
                      metadata: { component: 'ReleasesTable' }
                    }
                  ]
                }
              ]
            },
            {
              id: 'passport-release-detail-page',
              type: 'page',
              name: 'Release Detail Page',
              description: 'Individual release details',
              metadata: { route: '/releases/:id' },
              children: [
                {
                  id: 'passport-release-header-section',
                  type: 'section',
                  name: 'Release Header Section',
                  description: 'Release title and status',
                  children: [
                    {
                      id: 'passport-release-title-block',
                      type: 'block',
                      name: 'Title Block',
                      description: 'Audiobook title and cover',
                      metadata: { component: 'ReleaseHeader' }
                    },
                    {
                      id: 'passport-release-status-block',
                      type: 'block',
                      name: 'Status Block',
                      description: 'Distribution status',
                      metadata: { component: 'DistributionStatus' }
                    }
                  ]
                },
                {
                  id: 'passport-release-platforms-section',
                  type: 'section',
                  name: 'Platforms Section',
                  description: 'Distribution platforms',
                  children: [
                    {
                      id: 'passport-release-platforms-list-block',
                      type: 'block',
                      name: 'Platforms List Block',
                      description: 'Active distribution channels',
                      metadata: { component: 'PlatformsList' }
                    }
                  ]
                },
                {
                  id: 'passport-release-analytics-section',
                  type: 'section',
                  name: 'Analytics Section',
                  description: 'Distribution analytics',
                  children: [
                    {
                      id: 'passport-release-analytics-charts-block',
                      type: 'block',
                      name: 'Charts Block',
                      description: 'Distribution performance charts',
                      metadata: { component: 'AnalyticsCharts' }
                    }
                  ]
                }
              ]
            }
          ]
        },
        // Platforms Module
        {
          id: 'passport-platforms-module',
          type: 'module',
          name: 'Platforms Module',
          description: 'Distribution platform management',
          children: [
            {
              id: 'passport-platforms-page',
              type: 'page',
              name: 'Platforms Page',
              description: 'Connected distribution platforms',
              metadata: { route: '/platforms' },
              children: [
                {
                  id: 'passport-platforms-grid-section',
                  type: 'section',
                  name: 'Platforms Grid Section',
                  description: 'Platform cards',
                  children: [
                    {
                      id: 'passport-platforms-cards-block',
                      type: 'block',
                      name: 'Platform Cards Block',
                      description: 'Grid of connected platforms',
                      metadata: { component: 'PlatformCards' }
                    }
                  ]
                }
              ]
            },
            {
              id: 'passport-platform-detail-page',
              type: 'page',
              name: 'Platform Detail Page',
              description: 'Platform connection settings',
              metadata: { route: '/platforms/:id' },
              children: [
                {
                  id: 'passport-platform-settings-section',
                  type: 'section',
                  name: 'Settings Section',
                  description: 'Platform configuration',
                  children: [
                    {
                      id: 'passport-platform-settings-form-block',
                      type: 'block',
                      name: 'Settings Form Block',
                      description: 'API credentials and settings',
                      metadata: { component: 'PlatformSettingsForm' }
                    }
                  ]
                },
                {
                  id: 'passport-platform-stats-section',
                  type: 'section',
                  name: 'Statistics Section',
                  description: 'Platform performance',
                  children: [
                    {
                      id: 'passport-platform-stats-cards-block',
                      type: 'block',
                      name: 'Stats Cards Block',
                      description: 'Key performance indicators',
                      metadata: { component: 'PlatformStatsCards' }
                    }
                  ]
                }
              ]
            }
          ]
        },
        // Delivery Module
        {
          id: 'passport-delivery-module',
          type: 'module',
          name: 'Delivery Module',
          description: 'Content delivery management',
          children: [
            {
              id: 'passport-deliveries-page',
              type: 'page',
              name: 'Deliveries Page',
              description: 'Delivery queue and history',
              metadata: { route: '/deliveries' },
              children: [
                {
                  id: 'passport-deliveries-queue-section',
                  type: 'section',
                  name: 'Queue Section',
                  description: 'Active delivery queue',
                  children: [
                    {
                      id: 'passport-deliveries-queue-list-block',
                      type: 'block',
                      name: 'Queue List Block',
                      description: 'Pending deliveries',
                      metadata: { component: 'DeliveryQueue' }
                    }
                  ]
                },
                {
                  id: 'passport-deliveries-history-section',
                  type: 'section',
                  name: 'History Section',
                  description: 'Past deliveries',
                  children: [
                    {
                      id: 'passport-deliveries-history-table-block',
                      type: 'block',
                      name: 'History Table Block',
                      description: 'Completed deliveries',
                      metadata: { component: 'DeliveryHistoryTable' }
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
      id: 'voices-api',
      type: 'api',
      name: 'Voices API',
      description: 'Voices application backend API',
      metadata: { tech: 'Node.js + Express', port: '4000' }
    },
    {
      id: 'voices-database',
      type: 'database',
      name: 'Voices DB',
      description: 'Narrators, projects, and recordings data',
      metadata: { tech: 'PostgreSQL' }
    },
    {
      id: 'passport-api',
      type: 'api',
      name: 'Passport API',
      description: 'Passport application backend API',
      metadata: { tech: 'Node.js + Express', port: '4001' }
    },
    {
      id: 'passport-database',
      type: 'database',
      name: 'Passport DB',
      description: 'Distribution, platforms, and delivery data',
      metadata: { tech: 'PostgreSQL' }
    }
  ],
  relationships: [
    // Voices app relationships
    {
      id: 'rel-voices-1',
      type: 'communicates-with',
      sourceId: 'voices-app',
      targetId: 'voices-api',
      label: 'calls'
    },
    {
      id: 'rel-voices-2',
      type: 'writes-to',
      sourceId: 'voices-api',
      targetId: 'voices-database',
      label: 'persists'
    },
    // Passport app relationships
    {
      id: 'rel-passport-1',
      type: 'communicates-with',
      sourceId: 'passport-app',
      targetId: 'passport-api',
      label: 'calls'
    },
    {
      id: 'rel-passport-2',
      type: 'writes-to',
      sourceId: 'passport-api',
      targetId: 'passport-database',
      label: 'persists'
    },
    // Cross-app integration
    {
      id: 'rel-cross-1',
      type: 'reads-from',
      sourceId: 'passport-api',
      targetId: 'voices-database',
      label: 'fetches audiobooks'
    }
  ]
}
