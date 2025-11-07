# Application

A containerized system with UI and API layers within a platform.

## Properties

| Property | Type | Constraints | Required | Description |
|----------|------|-------------|----------|-------------|
| `type` | `any` | - |  |  |
| `ui` | `ui` | - |  | UI layer of the application. |
| `api` | `api` | - |  | API layer of the application. |

## Relationships

| Field | References | Description |
|-------|------------|-------------|
| `inherits` | `base` | Inherits from base |
| `ui` | `ui` | UI layer of the application. |
| `api` | `api` | API layer of the application. |

## Examples

### Loan Application System

```json
{
  "name": "Loan Application System",
  "key": "loanApplicationApp",
  "type": "Application",
  "description": "Application handling loan processing workflows",
  "ui": {
    "name": "Loan UI Layer",
    "key": "loanUiLayer",
    "type": "UI"
  },
  "api": {
    "name": "Loan API Layer",
    "key": "loanApiLayer",
    "type": "API"
  }
}
```

