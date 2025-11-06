# Workflow Schema

Defines a workflow — a sequence of actions performed by actors on resources.

## Examples

### Loan Application Approval Process

```json
{
  "name": "Loan Application Approval Process",
  "key": "loanApprovalWorkflow",
  "type": "Workflow",
  "description": "Complete workflow for processing and approving a loan application",
  "steps": [
    {
      "name": "Submit Application",
      "actor": "borrower-001",
      "action": "submit-application",
      "resource": "loan-app-12345"
    },
    {
      "name": "Initial Review",
      "actor": "loan-officer-role",
      "action": "review-application",
      "resource": "loan-app-12345",
      "conditions": [
        "application-complete"
      ]
    },
    {
      "name": "Credit Check",
      "actor": "credit-bureau-system",
      "action": "check-credit-score",
      "resource": "credit-report-001",
      "parallel": true
    },
    {
      "name": "Income Verification",
      "actor": "loan-officer-role",
      "action": "verify-income",
      "resource": "income-documents",
      "parallel": true
    },
    {
      "name": "Automated Underwriting",
      "actor": "underwriting-agent",
      "action": "evaluate-risk",
      "resource": "loan-app-12345",
      "conditions": [
        "credit-check-complete",
        "income-verified"
      ]
    },
    {
      "name": "Final Approval",
      "actor": "loan-officer-role",
      "action": "approve-loan",
      "resource": "loan-app-12345",
      "conditions": [
        "underwriting-approved"
      ]
    }
  ],
  "triggers": [
    {
      "type": "manual",
      "condition": "borrower-submits-application"
    },
    {
      "type": "scheduled",
      "condition": "daily-batch-processing"
    }
  ],
  "outputs": [
    "loan-decision",
    "approval-letter",
    "loan-terms"
  ]
}
```

