# Operation Schema

Defines an operation — a reusable specification for how work gets done, combining a resource, an action, capabilities (allowed actors), and lifecycle states. Operations are the blueprint for task instances.

## Examples

### Close Loan

```json
{
  "name": "Close Loan",
  "key": "loanClose",
  "type": "Operation",
  "description": "Mark a loan as closed, updating account status and finalizing records",
  "operation": {
    "resource": "Loan",
    "action": "close"
  },
  "capabilities": {
    "allowedActors": [
      "borrower",
      "loanOfficer"
    ],
    "conditions": [
      "resource.status == 'active'"
    ]
  },
  "lifecycle": {
    "initialState": "pending",
    "states": [
      "pending",
      "in_progress",
      "completed",
      "failed",
      "cancelled"
    ]
  }
}
```

### Submit Loan Application

```json
{
  "name": "Submit Loan Application",
  "key": "submitLoanApplication",
  "type": "Operation",
  "description": "Borrower submits a completed loan application with required documentation",
  "operation": {
    "resource": "LoanApplication",
    "action": "submit"
  },
  "capabilities": {
    "allowedActors": [
      "borrower"
    ],
    "conditions": []
  },
  "lifecycle": {
    "initialState": "pending",
    "states": [
      "pending",
      "in_progress",
      "completed",
      "failed"
    ]
  }
}
```

### Approve Loan Application

```json
{
  "name": "Approve Loan Application",
  "key": "approveLoanApplication",
  "type": "Operation",
  "description": "Loan officer or automated system approves a loan application after verification",
  "operation": {
    "resource": "loanApplication",
    "action": "approve"
  },
  "capabilities": {
    "allowedActors": [
      "loanOfficer",
      "underwritingAgent"
    ],
    "conditions": [
      "resource.status == 'under_review'",
      "resource.verificationComplete == true"
    ]
  },
  "lifecycle": {
    "initialState": "pending",
    "states": [
      "pending",
      "in_progress",
      "completed",
      "failed"
    ]
  }
}
```

