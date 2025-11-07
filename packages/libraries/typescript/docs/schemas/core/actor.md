# Actor

A user, role, system, or agent performing actions within the DNA model.

## Properties

| Property | Type | Constraints | Required | Description |
|----------|------|-------------|----------|-------------|
| `type` | `string` | enum: `Actor::User`, `Actor::Role`, `Actor::System`, `Actor::Agent` | ✓ | The specific classification of the actor. |

## Relationships

| Field | References | Description |
|-------|------------|-------------|
| `inherits` | `base` | Inherits from base |

## Examples

### Sarah Johnson

```json
{
  "name": "Sarah Johnson",
  "key": "borrower",
  "type": "Actor::User",
  "description": "Individual applying for a personal loan"
}
```

### Loan Officer

```json
{
  "name": "Loan Officer",
  "key": "loanOfficer",
  "type": "Actor::Role",
  "description": "Bank employee responsible for reviewing and approving loan applications"
}
```

### Credit Bureau API

```json
{
  "name": "Credit Bureau API",
  "key": "creditBureauApi",
  "type": "Actor::System",
  "description": "External system providing credit score and history data"
}
```

### Automated Underwriting Agent

```json
{
  "name": "Automated Underwriting Agent",
  "key": "underwritingAgent",
  "type": "Actor::Agent",
  "description": "AI agent that evaluates loan applications based on predefined criteria"
}
```

