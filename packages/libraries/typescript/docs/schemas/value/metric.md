# Metric

A quantifiable performance indicator that measures progress toward outcomes.

## Properties

| Property | Type | Constraints | Required | Description |
|----------|------|-------------|----------|-------------|
| `type` | `any` | - |  |  |
| `category` | `string` | enum: `financial`, `customer`, `operational`, `quality`, `efficiency`, `compliance` | ✓ | Category of the metric |
| `dataType` | `string` | enum: `number`, `percentage`, `currency`, `duration`, `count` | ✓ | Type of data this metric represents |
| `unit` | `string` | - | ✓ | Unit of measurement (e.g., USD, percent, minutes, count) |
| `scale` | `string` | - |  | Scale or range for the metric (e.g., '1-10', '0-100%') |
| `currentValue` | `number` | - |  | Current measured value |
| `targetValue` | `number` | - |  | Target value to achieve |
| `targetImprovement` | `string` | - |  | Expected improvement (e.g., '20%', '+15 points') |
| `measurementFrequency` | `string` | enum: `real-time`, `hourly`, `daily`, `weekly`, `monthly`, `quarterly` | ✓ | How frequently this metric is measured |
| `dataSource` | `string` | - |  | Source system or process that provides this metric data |
| `relatedOutcomes` | `string[]` | - |  | Outcomes this metric contributes to measuring |
| `trendDirection` | `string` | enum: `increasing`, `decreasing`, `stable`, `volatile` |  | Current trend direction of the metric |

## Relationships

| Field | References | Description |
|-------|------------|-------------|
| `inherits` | `base` | Inherits from base |

## Examples

### Borrower Satisfaction Score

```json
{
  "name": "Borrower Satisfaction Score",
  "key": "borrowerSatisfactionScore",
  "type": "Metric",
  "description": "Average customer satisfaction score based on post-loan surveys",
  "category": "customer",
  "dataType": "number",
  "unit": "score",
  "scale": "1-10",
  "currentValue": 7.2,
  "targetValue": 8.6,
  "targetImprovement": "20%",
  "measurementFrequency": "monthly",
  "dataSource": "customer-survey-system",
  "relatedOutcomes": [
    "increased-mrr-outcome"
  ],
  "trendDirection": "increasing"
}
```

### Loan Approval Rate

```json
{
  "name": "Loan Approval Rate",
  "key": "loanApprovalRate",
  "type": "Metric",
  "description": "Percentage of loan applications that are approved",
  "category": "operational",
  "dataType": "percentage",
  "unit": "percent",
  "currentValue": 68,
  "targetValue": 75,
  "measurementFrequency": "weekly",
  "dataSource": "loan-origination-system"
}
```

