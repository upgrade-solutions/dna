# Step Schema

Defines a step — an atomic building block representing Actor > Operation. Supports dual syntax: explicit (actor + resource + action) or dot notation (actor + operation).

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

