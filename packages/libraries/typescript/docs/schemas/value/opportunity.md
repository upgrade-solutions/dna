# Opportunity

A business improvement area that can drive measurable outcomes.

## Properties

| Property | Type | Constraints | Required | Description |
|----------|------|-------------|----------|-------------|
| `type` | `any` | - |  |  |
| `category` | `string` | enum: `customer-experience`, `operational-efficiency`, `cost-reduction`, `revenue-growth`, `compliance`, `engagement`, `automation` | ✓ | Category of business opportunity |
| `priority` | `string` | enum: `low`, `medium`, `high`, `critical` | ✓ | Business priority level |
| `estimatedImpact` | `string` | enum: `low`, `medium`, `high` | ✓ | Estimated business impact if addressed |
| `targetOutcomes` | `string[]` | - |  | Outcomes this opportunity aims to drive |
| `proposedSolutions` | `string[]` | - |  | Potential solutions to address this opportunity |
| `affectedWorkflows` | `string[]` | - |  | Workflows that would be impacted by addressing this opportunity |

## Relationships

| Field | References | Description |
|-------|------------|-------------|
| `inherits` | `base` | Inherits from base |

## Examples

### Improved Borrower Experience

```json
{
  "name": "Improved Borrower Experience",
  "key": "improvedBorrowerExperience",
  "type": "Opportunity",
  "description": "Streamline the loan application process to reduce friction and improve borrower satisfaction",
  "category": "customer-experience",
  "priority": "high",
  "estimatedImpact": "high",
  "targetOutcomes": [
    "increased-mrr-outcome",
    "reduced-churn-outcome"
  ],
  "proposedSolutions": [
    "borrower-dashboard",
    "automated-verification"
  ],
  "affectedWorkflows": [
    "loan-application-workflow",
    "borrower-onboarding-workflow"
  ]
}
```

### Better Borrower Engagement

```json
{
  "name": "Better Borrower Engagement",
  "key": "betterBorrowerEngagement",
  "type": "Opportunity",
  "description": "Increase borrower engagement through personalized communication and self-service options",
  "category": "engagement",
  "priority": "medium",
  "estimatedImpact": "medium",
  "targetOutcomes": [
    "increased-mrr-outcome"
  ]
}
```

