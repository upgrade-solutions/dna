# DNA Studio Product Versioning System

## Overview
This document outlines approaches for representing product version changes in the DNA Studio system, supporting the evolution from version 1.0.0 to 1.1.0 and beyond.

## Current State
- `Project` interface has optional `version?: string` field
- UI displays version with "1.0.0" fallback
- No version history or change tracking implemented

## Proposed Approaches

### Option 1: Simple Product-Level Versioning
Add version metadata directly to product objects:

```json
{
  "id": "1",
  "name": "Loan Platform",
  "description": "End-to-end loan origination and servicing platform",
  "version": "1.1.0",
  "versionHistory": [
    {
      "version": "1.0.0",
      "releaseDate": "2024-01-15",
      "description": "Initial release with core loan processing"
    },
    {
      "version": "1.1.0", 
      "releaseDate": "2024-03-20",
      "description": "Added automated risk assessment and enhanced reporting"
    }
  ],
  "projectCount": 4,
  "workflowCount": 5,
  "status": "Active",
  "organizationId": "org1"
}
```

### Option 2: Workflow-Level Versioning
Track versions at the workflow level for granular change management:

```json
{
  "id": "wf2",
  "name": "Loan Application",
  "description": "Loan request submission and processing",
  "version": "1.1.0",
  "previousVersions": ["1.0.0"],
  "versionChanges": {
    "1.1.0": {
      "changes": ["Added automated credit scoring", "Enhanced validation rules"],
      "modifiedSteps": ["s6", "s7"],
      "addedSteps": ["s8"],
      "releaseDate": "2024-03-20"
    }
  },
  "status": "Active",
  "productId": "1"
}
```

### Option 3: Comprehensive Version Management
Full version control with change tracking, rollback capabilities, and semantic versioning:

```json
{
  "versionControl": {
    "currentVersion": "1.1.0",
    "versions": {
      "1.0.0": {
        "releaseDate": "2024-01-15",
        "status": "archived",
        "snapshot": {
          "workflows": ["wf1", "wf2", "wf3"],
          "steps": {
            "wf2": ["s5", "s6", "s7", "s9"]
          }
        },
        "description": "Initial release"
      },
      "1.1.0": {
        "releaseDate": "2024-03-20", 
        "status": "active",
        "changes": {
          "type": "minor",
          "summary": "Enhanced risk assessment and reporting",
          "workflows": {
            "modified": ["wf2", "wf4"],
            "added": [],
            "removed": []
          },
          "steps": {
            "added": ["s8"],
            "modified": ["s6", "s7"],
            "removed": []
          }
        },
        "migration": {
          "breaking": false,
          "dataChanges": ["Added riskScore field to loan applications"],
          "upgradeNotes": "Automatic upgrade - no manual intervention required"
        }
      }
    }
  }
}
```

## Implementation Strategy

### Phase 1: Basic Versioning (Immediate)
1. Add version field to existing products
2. Update UI to show current version prominently
3. Add simple version history display

### Phase 2: Change Tracking (Short-term)
1. Implement workflow-level versioning
2. Track changes between versions
3. Add version comparison views

### Phase 3: Full Version Control (Long-term)
1. Implement comprehensive version management
2. Add rollback capabilities
3. Support for semantic versioning rules
4. Automated change detection

## UI/UX Considerations

### Version Display
- Prominent version indicator in product/project cards
- Version badge with semantic color coding (major=red, minor=blue, patch=green)
- "What's New" summaries for version changes

### Version Management Interface
- Version history timeline
- Change comparison views
- Version rollback controls (for authorized users)
- Release notes and migration guides

### Workflow Integration
- Visual indicators for workflow changes between versions
- Step-level change tracking
- Form schema evolution tracking

## Benefits

1. **Change Visibility**: Clear understanding of what changed between versions
2. **Rollback Safety**: Ability to revert to previous working versions
3. **Impact Analysis**: Understanding downstream effects of changes
4. **Compliance**: Audit trail for regulatory requirements
5. **Collaboration**: Better coordination between teams on version changes

## Next Steps

1. Choose initial approach (recommend Option 1 for MVP)
2. Update data models and types
3. Implement UI components for version display
4. Create sample data with version information
5. Add version management workflow to studio interface