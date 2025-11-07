# Platform

A container for applications with UI and API layers.

## Properties

| Property | Type | Constraints | Required | Description |
|----------|------|-------------|----------|-------------|
| `type` | `any` | - |  |  |
| `version` | `string` | - |  | Platform version following semantic versioning. |
| `applications` | `application[]` | - |  | Applications that are part of this platform. |

## Relationships

| Field | References | Description |
|-------|------------|-------------|
| `inherits` | `base` | Inherits from base |

## Examples

### Digital Banking Platform

```json
{
  "name": "Digital Banking Platform",
  "key": "digitalBankingPlatform",
  "type": "Platform",
  "description": "Complete platform for banking operations including UI interfaces and API services",
  "version": "1.0.0",
  "applications": [
    {
      "name": "Loan Application System",
      "key": "loanApplicationApp",
      "type": "Application"
    }
  ]
}
```

