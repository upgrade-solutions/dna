# Application Schema

Defines an application — a containerized system with UI and API layers within a platform.

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

