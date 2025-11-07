# Task

A runtime instance representing a specific unit of work being performed by an actor on a resource, with state tracking and lifecycle management.

## Properties

| Property | Type | Constraints | Required | Description |
|----------|------|-------------|----------|-------------|
| `type` | `string` | - | ✓ | Identifies this as a task instance. |
| `operation` | `operation` | - | ✓ | Reference to the operation (key) that defines this task's resource, action, capabilities, and lifecycle. |
| `actor` | `actor` | - | ✓ | The specific actor performing this task. Must be one of the allowed actors defined in the referenced operation's capabilities. |
| `resource` | `resource` | - | ✓ | The specific resource being acted upon in this task. |
| `state` | `string` | enum: `pending`, `in_progress`, `completed`, `failed`, `cancelled` | ✓ | Current state of the task instance. Must be one of the states defined in the referenced operation's lifecycle. |
| `createdAt` | `string (date-time)` | - | ✓ | ISO 8601 timestamp when this task instance was created. |
| `stateHistory` | `state-transition[]` | - | ✓ | Complete audit trail of all state transitions for this task instance. |
| `context` | `object` | - |  | Optional execution context containing parameters, configuration, or state specific to this task instance. |
| `error` | `object` | - |  | Error information if the task failed. |

## Relationships

| Field | References | Description |
|-------|------------|-------------|
| `inherits` | `base` | Inherits from base |
| `operation` | `operation` | Reference to the operation (key) that defines this task's resource, action, capabilities, and lifecycle. |
| `actor` | `actor` | The specific actor performing this task. Must be one of the allowed actors defined in the referenced operation's capabilities. |
| `resource` | `resource` | The specific resource being acted upon in this task. |

## Examples

### Close Loan #123

```json
{
  "id": "task-456",
  "name": "Close Loan #123",
  "key": "task-456-loanClose",
  "type": "Task",
  "description": "Borrower closes their personal loan",
  "operation": "loanClose",
  "actor": "borrower-789",
  "resource": "loan-123",
  "state": "in_progress",
  "createdAt": "2025-11-05T10:00:00Z",
  "stateHistory": [
    {
      "state": "pending",
      "enteredAt": "2025-11-05T10:00:00Z",
      "exitedAt": "2025-11-05T10:05:00Z"
    },
    {
      "state": "in_progress",
      "enteredAt": "2025-11-05T10:05:00Z",
      "actor": "borrower-789"
    }
  ],
  "context": {
    "closureReason": "early_payoff",
    "appliedPayment": 25000
  }
}
```

### Approve Loan Application #456

```json
{
  "id": "task-789",
  "name": "Approve Loan Application #456",
  "key": "task-789-approveLoanApplication",
  "type": "Task",
  "description": "Loan officer approves a borrower's loan application",
  "operation": "approveLoanApplication",
  "actor": "loanOfficer-234",
  "resource": "loanApplication-456",
  "state": "completed",
  "createdAt": "2025-11-04T14:30:00Z",
  "stateHistory": [
    {
      "state": "pending",
      "enteredAt": "2025-11-04T14:30:00Z",
      "exitedAt": "2025-11-04T15:00:00Z"
    },
    {
      "state": "in_progress",
      "enteredAt": "2025-11-04T15:00:00Z",
      "exitedAt": "2025-11-04T15:45:00Z",
      "actor": "loanOfficer-234"
    },
    {
      "state": "completed",
      "enteredAt": "2025-11-04T15:45:00Z"
    }
  ],
  "context": {
    "approvalNotes": "All documentation verified, credit score acceptable",
    "approvalAmount": 50000
  }
}
```

### Verify Income for Loan Application #456

```json
{
  "id": "task-101",
  "name": "Verify Income for Loan Application #456",
  "key": "task-101-verifyIncome",
  "type": "Task",
  "description": "System verifies borrower income documentation against provided sources",
  "operation": "verifyIncome",
  "actor": "underwritingAgent",
  "resource": "loanApplication-456",
  "state": "failed",
  "createdAt": "2025-11-04T14:00:00Z",
  "stateHistory": [
    {
      "state": "pending",
      "enteredAt": "2025-11-04T14:00:00Z",
      "exitedAt": "2025-11-04T14:05:00Z"
    },
    {
      "state": "in_progress",
      "enteredAt": "2025-11-04T14:05:00Z",
      "exitedAt": "2025-11-04T14:30:00Z",
      "actor": "underwritingAgent",
      "metadata": {
        "verificationAttempts": 2
      }
    },
    {
      "state": "failed",
      "enteredAt": "2025-11-04T14:30:00Z"
    }
  ],
  "error": {
    "code": "VERIFICATION_FAILED",
    "message": "Income documentation could not be verified with provided sources",
    "details": "W-2 forms do not match employment verification response"
  }
}
```

