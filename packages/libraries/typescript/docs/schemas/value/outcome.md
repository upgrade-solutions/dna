# Outcome

A measurable business result achieved through programs, projects, or workflows.

## Properties

| Property | Type | Constraints | Required | Description |
|----------|------|-------------|----------|-------------|
| `type` | `any` | - |  |  |
| `category` | `string` | enum: `financial`, `customer`, `operational`, `compliance`, `strategic` | ✓ | Category of business outcome |
| `targetValue` | `number` | - | ✓ | Target value for the outcome |
| `currentValue` | `number` | - |  | Current achieved value |
| `unit` | `string` | - | ✓ | Unit of measurement (e.g., USD, percent, count) |
| `measurementPeriod` | `string` | enum: `daily`, `weekly`, `monthly`, `quarterly`, `annually` | ✓ | How frequently this outcome is measured |
| `achievedDate` | `string (date)` | - |  | Date when the target was achieved (if applicable) |
| `relatedOpportunities` | `string[]` | - |  | Opportunities that contribute to this outcome |
| `contributingMetrics` | `string[]` | - |  | Metrics that influence this outcome |

## Relationships

| Field | References | Description |
|-------|------------|-------------|
| `inherits` | `base` | Inherits from base |

## Examples

### Increased Monthly Recurring Revenue

```json
{
  "name": "Increased Monthly Recurring Revenue",
  "key": "increasedMRR",
  "type": "Outcome",
  "description": "25% increase in monthly recurring revenue from improved borrower retention",
  "category": "financial",
  "targetValue": 125000,
  "currentValue": 100000,
  "unit": "USD",
  "measurementPeriod": "monthly",
  "achievedDate": "2024-06-30",
  "relatedOpportunities": [
    "improved-borrower-experience"
  ],
  "contributingMetrics": [
    "borrower-satisfaction-score",
    "loan-approval-rate"
  ]
}
```

### Reduced Customer Churn

```json
{
  "name": "Reduced Customer Churn",
  "key": "reducedChurn",
  "type": "Outcome",
  "description": "40% reduction in customer churn rate through improved onboarding",
  "category": "customer",
  "targetValue": 5,
  "currentValue": 8.3,
  "unit": "percent",
  "measurementPeriod": "quarterly",
  "relatedOpportunities": [
    "better-onboarding-experience"
  ]
}
```

