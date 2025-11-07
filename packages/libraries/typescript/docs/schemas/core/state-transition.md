# State Transition

A record of a single state transition in an entity's lifecycle.

## Properties

| Property | Type | Constraints | Required | Description |
|----------|------|-------------|----------|-------------|
| `state` | `string` | pattern: `^[a-z][a-z_]*$` | ✓ | The state the entity was in during this period. |
| `enteredAt` | `string (date-time)` | - | ✓ | ISO 8601 timestamp when this state was entered. |
| `exitedAt` | `string (date-time)` | - |  | ISO 8601 timestamp when this state was exited. Omitted for the current state. |
| `actor` | `string` | - |  | Optional identifier of the actor who triggered this state transition. |
| `reason` | `string` | - |  | Optional reason or context for the state transition. |
| `metadata` | `object` | - |  | Optional additional context or data associated with this state period. |

## Examples

### Example 1

```json
{
  "state": "pending",
  "enteredAt": "2025-11-04T14:30:00Z",
  "exitedAt": "2025-11-04T15:00:00Z"
}
```

### Example 2

```json
{
  "state": "in_progress",
  "enteredAt": "2025-11-04T15:00:00Z",
  "exitedAt": "2025-11-04T15:45:00Z",
  "actor": "loanOfficer-234"
}
```

### Example 3

```json
{
  "state": "completed",
  "enteredAt": "2025-11-04T15:45:00Z"
}
```

