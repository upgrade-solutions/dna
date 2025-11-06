# Resource Schema

Defines a resource — a data entity or object acted upon within the DNA model.

## Examples

### Loan Application

```json
{
  "name": "Loan Application",
  "key": "LoanApplication",
  "type": "Resource",
  "description": "A loan application submitted by a borrower",
  "actions": [
    {
      "name": "Submit Loan Application",
      "key": "submitLoanApplication",
      "type": "Action"
    },
    {
      "name": "Review Loan Application",
      "key": "reviewLoanApplication",
      "type": "Action"
    },
    {
      "name": "Approve Loan",
      "key": "approveLoan",
      "type": "Action"
    }
  ],
  "attributes": [
    {
      "name": "Loan Amount",
      "key": "loanAmount",
      "type": "Attribute",
      "value": 25000,
      "dataType": "number"
    },
    {
      "name": "Loan Purpose",
      "key": "loanPurpose",
      "type": "Attribute",
      "value": "debt consolidation",
      "dataType": "string"
    }
  ]
}
```

### Credit Report

```json
{
  "name": "Credit Report",
  "key": "creditReport",
  "type": "Resource",
  "description": "Credit report containing borrower's credit history and score",
  "actions": [
    {
      "name": "Check Credit Score",
      "key": "checkCreditScore",
      "type": "Action"
    }
  ],
  "attributes": [
    {
      "name": "Credit Score",
      "key": "creditScore",
      "type": "Attribute",
      "value": 720,
      "dataType": "number"
    }
  ]
}
```

