# Metric Schema

Defines a metric — a quantifiable performance indicator that measures progress toward outcomes.

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

