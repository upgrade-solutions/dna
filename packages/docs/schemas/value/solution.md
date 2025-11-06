# Solution Schema

Defines a solution — a proposed implementation to address opportunities and drive outcomes.

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

