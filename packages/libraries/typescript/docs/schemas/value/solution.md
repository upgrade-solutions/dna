# Solution

A proposed implementation to address opportunities and drive outcomes.

## Properties

| Property | Type | Constraints | Required | Description |
|----------|------|-------------|----------|-------------|
| `type` | `any` | - |  |  |
| `category` | `string` | enum: `digital-platform`, `automation`, `integration`, `process-improvement`, `infrastructure`, `analytics` | ✓ | Category of solution |
| `implementationType` | `string` | enum: `build`, `buy`, `configure`, `integrate`, `outsource` | ✓ | How this solution will be implemented |
| `estimatedCost` | `number` | min: 0 |  | Estimated implementation cost |
| `estimatedDuration` | `string` | pattern: `^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$` |  | Estimated time to implement (ISO 8601 duration format) |
| `complexity` | `string` | enum: `low`, `medium`, `high` |  | Implementation complexity level |
| `targetOpportunities` | `string[]` | - |  | Opportunities this solution addresses |
| `expectedOutcomes` | `string[]` | - |  | Outcomes this solution is expected to contribute to |
| `affectedWorkflows` | `string[]` | - |  | Workflows that will be modified by this solution |
| `technicalRequirements` | `string[]` | - |  | Technical requirements for implementation |
| `dependencies` | `string[]` | - |  | Systems or components this solution depends on |

## Relationships

| Field | References | Description |
|-------|------------|-------------|
| `inherits` | `base` | Inherits from base |

## Examples

### Borrower Self-Service Dashboard

```json
{
  "name": "Borrower Self-Service Dashboard",
  "key": "borrowerDashboard",
  "type": "Solution",
  "description": "Web-based dashboard allowing borrowers to track application status, upload documents, and manage their loan",
  "category": "digital-platform",
  "implementationType": "build",
  "estimatedCost": 150000,
  "estimatedDuration": "PT3M",
  "complexity": "medium",
  "targetOpportunities": [
    "improved-borrower-experience"
  ],
  "expectedOutcomes": [
    "increased-mrr-outcome",
    "reduced-churn-outcome"
  ],
  "affectedWorkflows": [
    "loan-application-workflow"
  ],
  "technicalRequirements": [
    "React frontend application",
    "REST API integration",
    "Authentication system",
    "Document upload capability"
  ],
  "dependencies": [
    "customer-identity-system",
    "document-storage-service"
  ]
}
```

### Automated Document Verification

```json
{
  "name": "Automated Document Verification",
  "key": "automatedVerification",
  "type": "Solution",
  "description": "AI-powered system to automatically verify income and identity documents",
  "category": "automation",
  "implementationType": "build",
  "estimatedCost": 200000,
  "complexity": "high",
  "targetOpportunities": [
    "improved-borrower-experience"
  ]
}
```

