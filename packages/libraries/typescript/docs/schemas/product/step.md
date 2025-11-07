# Step

An atomic building block representing Actor > Operation, supporting explicit and dot notation syntax.

## Properties

| Property | Type | Constraints | Required | Description |
|----------|------|-------------|----------|-------------|
| `type` | `any` | - |  |  |
| `actor` | `string` | - | ✓ | Reference to the actor performing this step |
| `action` | `string` | - |  | Reference to the action being performed (used with explicit syntax) |
| `resource` | `string` | - |  | Reference to the resource being acted upon (used with explicit syntax) |
| `operation` | `string` | pattern: `^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$` |  | Resource.action operation in dot notation (e.g., 'loan.apply', 'credit_report.check') |
| `order` | `integer` | min: 1 |  | Execution order within the workflow (1-based) |
| `conditions` | `string[]` | - |  | Prerequisites that must be met for this step to execute |
| `parallel` | `boolean` | - |  | Whether this step can execute in parallel with other steps |
| `automated` | `boolean` | - |  | Whether this step is fully automated (no human intervention required) |
| `optional` | `boolean` | - |  | Whether this step is optional in the workflow |
| `timeout` | `string` | pattern: `^P(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$` |  | Maximum time allowed for step execution (ISO 8601 duration format) |
| `estimatedDuration` | `string` | pattern: `^P(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$` |  | Expected duration for step completion (ISO 8601 duration format) |
| `retryPolicy` | `object` | - |  | Retry policy for failed step executions |
| `inputs` | `object[]` | - |  | Required inputs for step execution |
| `outputs` | `string[]` | - |  | Expected outputs produced by step execution |
| `notifications` | `object[]` | - |  | Notification rules for step events |
| `validation` | `object` | - |  | Validation rules for step execution |

## Relationships

| Field | References | Description |
|-------|------------|-------------|
| `inherits` | `base` | Inherits from base |

## Examples

### Submit Loan Application

```json
{
  "name": "Submit Loan Application",
  "key": "submitLoanApplication",
  "type": "Step",
  "description": "Borrower submits a completed loan application with required documentation",
  "actor": "borrower-001",
  "action": "submit-application",
  "resource": "loan-app-12345",
  "order": 1,
  "conditions": [],
  "parallel": false,
  "timeout": "PT30M",
  "retryPolicy": {
    "maxAttempts": 3,
    "backoffStrategy": "exponential"
  },
  "outputs": [
    "application-submitted-event",
    "application-id"
  ]
}
```

### Verify Income Documentation

```json
{
  "name": "Verify Income Documentation",
  "key": "verifyIncomeDocumentation",
  "type": "Step",
  "description": "Loan officer verifies the authenticity and accuracy of borrower's income documentation",
  "actor": "loan-officer-role",
  "action": "verify-income",
  "resource": "income-documents",
  "order": 3,
  "conditions": [
    "application-complete",
    "documents-uploaded"
  ],
  "parallel": true,
  "timeout": "PT2H",
  "estimatedDuration": "PT45M",
  "outputs": [
    "income-verification-result",
    "verification-notes"
  ]
}
```

### Automated Credit Score Check

```json
{
  "name": "Automated Credit Score Check",
  "key": "automatedCreditCheck",
  "type": "Step",
  "description": "System automatically retrieves and processes borrower's credit report from credit bureau",
  "actor": "credit-bureau-system",
  "action": "check-credit-score",
  "resource": "credit-report-001",
  "order": 2,
  "conditions": [
    "application-submitted"
  ],
  "parallel": true,
  "automated": true,
  "timeout": "PT5M",
  "retryPolicy": {
    "maxAttempts": 5,
    "backoffStrategy": "linear",
    "retryDelay": "PT30S"
  },
  "outputs": [
    "credit-score",
    "credit-history-summary"
  ]
}
```

### Fund Approved Loan

```json
{
  "name": "Fund Approved Loan",
  "key": "fundApprovedLoan",
  "type": "Step",
  "description": "System automatically funds the approved loan by transferring money to borrower's account",
  "actor": "funding-system",
  "operation": "loan.fund",
  "order": 4,
  "conditions": [
    "loan-approved"
  ],
  "automated": true,
  "timeout": "PT10M",
  "outputs": [
    "funding-confirmation",
    "transaction-id"
  ]
}
```

