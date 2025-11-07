# Operation

A reusable specification for how work gets done, combining a resource, an action, capabilities, and lifecycle states.

## Properties

| Property | Type | Constraints | Required | Description |
|----------|------|-------------|----------|-------------|
| `type` | `string` | - | ✓ | Identifies this as an operation definition. |
| `operation` | `object` | - | ✓ | The operation specification (what work is being defined). |
| `capabilities` | `object` | - | ✓ | Defines who can perform this operation and under what conditions. |
| `lifecycle` | `object` | - | ✓ | Defines the state machine for task instances based on this operation. |

## Relationships

| Field | References | Description |
|-------|------------|-------------|
| `inherits` | `base` | Inherits from base |

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

