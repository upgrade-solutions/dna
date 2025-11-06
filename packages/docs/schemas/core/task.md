# Task Schema

Defines a task — a runtime instance of a task template, representing a specific unit of work being performed by an actor on a resource, with state tracking and lifecycle management.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✓ | Unique identifier for this task instance. |
| `name` | `string` | ✓ | Human-readable name for this specific task instance. |
| `key` | `string` | ✓ | Programmatic identifier for this task instance, suitable for use in code and APIs. |
| `type` | `string` | ✓ | Identifies this as a task instance. |
| `description` | `string` |  | Detailed explanation of what this specific task is doing. |
| `operation` | `string` | ✓ | Reference to the operation (key) that defines this task's resource, action, capabilities, and lifecycle. |
| `actor` | `string` | ✓ | The specific actor performing this task (e.g., 'borrower-789', 'loanOfficer-234'). |
| `resource` | `string` | ✓ | The specific resource being acted upon (e.g., 'loan-123', 'loanApplication-456'). |
| `state` | `string` | ✓ | Current state of the task instance (e.g., 'pending', 'in_progress', 'completed', 'failed', 'cancelled'). Must be one of the states defined in the task template's lifecycle. |
| `createdAt` | `string` | ✓ | ISO 8601 timestamp when this task instance was created. |
| `startedAt` | `string` |  | ISO 8601 timestamp when this task instance transitioned to 'in_progress' state. |
| `completedAt` | `string` |  | ISO 8601 timestamp when this task instance successfully completed. |
| `failedAt` | `string` |  | ISO 8601 timestamp when this task instance transitioned to 'failed' state. |
| `cancelledAt` | `string` |  | ISO 8601 timestamp when this task instance was cancelled. |
| `context` | `object` |  | Optional execution context containing parameters, configuration, or state specific to this task instance. |
| `error` | `object` |  | Error information if the task failed. |

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
  "startedAt": "2025-11-05T10:05:00Z",
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
  "startedAt": "2025-11-04T15:00:00Z",
  "completedAt": "2025-11-04T15:45:00Z",
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
  "startedAt": "2025-11-04T14:05:00Z",
  "failedAt": "2025-11-04T14:30:00Z",
  "context": {
    "verificationAttempts": 2
  },
  "error": {
    "code": "VERIFICATION_FAILED",
    "message": "Income documentation could not be verified with provided sources",
    "details": "W-2 forms do not match employment verification response"
  }
}
```

