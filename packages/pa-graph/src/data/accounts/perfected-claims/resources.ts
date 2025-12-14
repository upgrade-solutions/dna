/**
 * Perfected Claims Platform Resources
 * Mass tort case management system architecture
 * 
 * Legend Status Indicators:
 * - doesnt-exist: No process (gray)
 * - manual: Manual process (yellow + star)
 * - legacy: Legacy system / Third party vendor (cyan + wrench)
 * - completed: Completed feature (orange)
 * - roadmap: On roadmap (green)
 * - in-progress: In progress (magenta)
 * - future: Future phase (purple)
 */

import type { ResourceGraph } from '../../example-resources'

export const perfectedClaimsResources: ResourceGraph = {
  resources: [
    {
      id: 'perfected-claims-org',
      type: 'organization',
      name: 'Perfected Claims',
      description: 'Mass tort case management platform',
      metadata: { 
        level: 0,
        status: 'completed'
      },
      children: [
        // Level 1: Case Development
        {
          id: 'case-development',
          type: 'application',
          name: 'Case Development',
          description: 'End-to-end case intake and development workflow',
          metadata: { 
            level: 1,
            status: 'in-progress'
          },
          children: [
            // Level 2: Quality Assurance
            {
              id: 'quality-assurance',
              type: 'module',
              name: 'Quality Assurance',
              description: 'Case quality validation and verification processes',
              metadata: { 
                level: 2,
                status: 'in-progress'
              },
              children: [
                // Level 3: QA Processes
                {
                  id: 'case-tracking-all-status',
                  type: 'page',
                  name: 'Case Tracking - All Status',
                  description: 'Track cases across all stages',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/qa/cases'
                  }
                },
                {
                  id: 'permissions-management',
                  type: 'page',
                  name: 'Permissions Management',
                  description: 'User access control and permissions',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/qa/permissions'
                  }
                },
                {
                  id: 'case-assignment',
                  type: 'page',
                  name: 'Case Assignment',
                  description: 'Assign cases to team members',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/qa/assign'
                  }
                },
                {
                  id: 'damage-assignments',
                  type: 'page',
                  name: 'Damage Assignments',
                  description: 'Track and assign damage assessments',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/qa/damages'
                  }
                },
                {
                  id: 'document-verification',
                  type: 'page',
                  name: 'Document Verification',
                  description: 'Verify authenticity and completeness of documents',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/qa/verify-docs'
                  }
                },
                {
                  id: 'data-governance',
                  type: 'page',
                  name: 'Data Governance',
                  description: 'Data quality and compliance oversight',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/qa/governance'
                  }
                },
                {
                  id: 'deficiency-management-1',
                  type: 'page',
                  name: 'Deficiency Management 1.0',
                  description: 'Track and resolve case deficiencies',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/qa/deficiencies/v1'
                  }
                },
                {
                  id: 'deficiency-management-2',
                  type: 'page',
                  name: 'Deficiency Management 2.0',
                  description: 'Enhanced deficiency tracking and workflow',
                  metadata: { 
                    level: 3,
                    status: 'future',
                    route: '/qa/deficiencies/v2'
                  }
                },
                {
                  id: 'post-case-intake-verification-dnq',
                  type: 'page',
                  name: 'Post Case Intake Verification for DNQ',
                  description: 'Verify does-not-qualify cases',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/qa/verify-dnq'
                  }
                }
              ]
            },
            // Level 2: Medical Record Admin
            {
              id: 'medical-record-admin',
              type: 'module',
              name: 'Medical Record Admin',
              description: 'Medical records retrieval and management',
              metadata: { 
                level: 2,
                status: 'in-progress'
              },
              children: [
                // Level 3: Medical Records Processes
                {
                  id: 'medical-record-review-patterns',
                  type: 'page',
                  name: 'Medical Record Review (Patterns)',
                  description: 'Pattern-based medical record analysis',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/medical/review-patterns'
                  }
                },
                {
                  id: 'medical-record-retrieval-nrr',
                  type: 'page',
                  name: 'Medical Record Retrieval (NRR)',
                  description: 'National record retrieval integration',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/medical/retrieval-nrr'
                  }
                },
                {
                  id: 'insurance-verification',
                  type: 'page',
                  name: 'Insurance Verification',
                  description: 'Verify insurance coverage and benefits',
                  metadata: { 
                    level: 3,
                    status: 'future',
                    route: '/medical/insurance'
                  }
                },
                {
                  id: 'automated-task-management',
                  type: 'page',
                  name: 'Automated Task Management',
                  description: 'Workflow automation for medical records',
                  metadata: { 
                    level: 3,
                    status: 'in-progress',
                    route: '/medical/tasks'
                  }
                },
                {
                  id: 'electronic-medical-records-retrievals',
                  type: 'page',
                  name: 'Electronic Medical Records Retrievals',
                  description: 'EMR system integration and retrieval',
                  metadata: { 
                    level: 3,
                    status: 'future',
                    route: '/medical/emr'
                  }
                },
                {
                  id: 'case-grouping',
                  type: 'page',
                  name: 'Case Grouping',
                  description: 'Group related cases for batch processing',
                  metadata: { 
                    level: 3,
                    status: 'in-progress',
                    route: '/medical/grouping'
                  }
                }
              ]
            },
            // Level 2: Document Management & Intake
            {
              id: 'document-management',
              type: 'module',
              name: 'Document Management & Intake',
              description: 'Document processing and client intake',
              metadata: { 
                level: 2,
                status: 'completed'
              },
              children: [
                // Level 3: Document & Intake Processes
                {
                  id: 'sync-store-documents',
                  type: 'page',
                  name: 'Sync and Store Documents',
                  description: 'Document synchronization and storage',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/docs/sync'
                  }
                },
                {
                  id: 'pre-qualification',
                  type: 'page',
                  name: 'Pre-Qualification',
                  description: 'Initial case eligibility screening',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/intake/pre-qual'
                  }
                },
                {
                  id: 'identity-verification-service',
                  type: 'page',
                  name: 'Identity Verification Service',
                  description: 'Verify client identity and credentials',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/intake/verify-identity'
                  }
                },
                {
                  id: 'edms-features',
                  type: 'page',
                  name: 'Enhanced Document Management System (EDMS) Features',
                  description: 'Advanced document management capabilities',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/docs/edms'
                  }
                },
                {
                  id: 'dynamic-document-requirements',
                  type: 'page',
                  name: 'Dynamic Document Requirements (per document)',
                  description: 'Context-aware document requirements engine',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/docs/requirements'
                  }
                }
              ]
            },
            // Level 2: Beginning of Mass Tort Management (Yellow sticky note)
            {
              id: 'mass-tort-initiation',
              type: 'module',
              name: 'Beginning of Mass Tort Management',
              description: 'Initial case setup and team formation',
              metadata: { 
                level: 2,
                status: 'manual',
                note: 'Manual kickoff process'
              }
            },
            // Level 2: All of Yesenia's Team (Yellow sticky note)
            {
              id: 'yesenias-team',
              type: 'module',
              name: "All of Yesenia's Team",
              description: 'Team coordination and case assignment',
              metadata: { 
                level: 2,
                status: 'manual',
                note: 'Manual team management'
              }
            },
            // Level 2: Medical Record Admin (Third Party - Partner with NRR)
            {
              id: 'medical-record-admin-partner',
              type: 'module',
              name: 'Medical Record Admin',
              description: 'Partner with NRR for record retrieval',
              metadata: { 
                level: 2,
                status: 'legacy',
                vendor: 'National Record Retrieval (NRR)'
              },
              children: [
                {
                  id: 'medical-record-retrieval-partner',
                  type: 'page',
                  name: 'Medical Record Retrieval',
                  description: 'External retrieval company integration',
                  metadata: { 
                    level: 3,
                    status: 'legacy',
                    route: '/medical/external-retrieval'
                  }
                },
                {
                  id: 'external-retrieval-company',
                  type: 'page',
                  name: 'External retrieval company',
                  description: 'Third-party medical records service',
                  metadata: { 
                    level: 3,
                    status: 'legacy',
                    vendor: 'Multiple providers'
                  }
                },
                {
                  id: 'partner-with-nrr',
                  type: 'page',
                  name: 'Partner with NRR for this',
                  description: 'National Record Retrieval partnership',
                  metadata: { 
                    level: 3,
                    status: 'legacy',
                    vendor: 'NRR'
                  }
                }
              ]
            },
            // Level 2: Additional Workflows
            {
              id: 'client-communications',
              type: 'module',
              name: 'Client Communications',
              description: 'Client messaging and notifications',
              metadata: { 
                level: 2,
                status: 'roadmap'
              },
              children: [
                {
                  id: 'manage-medical-records-from-client',
                  type: 'page',
                  name: 'Manage Medical Records from Client',
                  description: 'Client-submitted medical records processing',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/client/medical-records'
                  }
                },
                {
                  id: 'assign-proof',
                  type: 'page',
                  name: 'Assign Proof',
                  description: 'Assign proof of injury verification tasks',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/client/assign-proof'
                  }
                },
                {
                  id: 'fmp-maui-questionnaire',
                  type: 'page',
                  name: 'FMP Maui Questionnaire',
                  description: 'Fire Management Platform Maui intake form',
                  metadata: { 
                    level: 3,
                    status: 'completed',
                    route: '/client/fmp-maui'
                  }
                },
                {
                  id: 'question-proof',
                  type: 'page',
                  name: 'Question and Proof',
                  description: 'Q&A and evidence submission workflow',
                  metadata: { 
                    level: 3,
                    status: 'future',
                    route: '/client/qa-proof'
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    // External Services
    {
      id: 'case-api',
      type: 'api',
      name: 'Case Management API',
      description: 'REST API for case operations',
      metadata: { 
        tech: 'Node.js + Express',
        status: 'completed'
      }
    },
    // {
    //   id: 'case-database',
    //   type: 'database',
    //   name: 'Case Database',
    //   description: 'PostgreSQL database for case data',
    //   metadata: { 
    //     tech: 'PostgreSQL',
    //     status: 'completed'
    //   }
    // },
    // {
    //   id: 'nrr-service',
    //   type: 'external-service',
    //   name: 'National Record Retrieval',
    //   description: 'Third-party medical records retrieval service',
    //   metadata: { 
    //     vendor: 'NRR',
    //     status: 'legacy'
    //   }
    // }
  ],
  relationships: [
    // // Case Development to API
    // {
    //   id: 'rel-case-dev-api',
    //   type: 'communicates-with',
    //   sourceId: 'case-development',
    //   targetId: 'case-api',
    //   label: 'uses'
    // },
    // // API to Database
    // {
    //   id: 'rel-api-db',
    //   type: 'writes-to',
    //   sourceId: 'case-api',
    //   targetId: 'case-database',
    //   label: 'persists'
    // },
    // // Medical Records to NRR
    // {
    //   id: 'rel-medical-nrr',
    //   type: 'integrates-with',
    //   sourceId: 'medical-record-admin',
    //   targetId: 'nrr-service',
    //   label: 'retrieves via'
    // },
    // // Quality Assurance to Document Management
    // {
    //   id: 'rel-qa-docs',
    //   type: 'depends-on',
    //   sourceId: 'quality-assurance',
    //   targetId: 'document-management',
    //   label: 'validates'
    // }
  ]
}
