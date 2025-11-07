# Program

A strategic initiative that coordinates multiple related projects to achieve larger organizational goals.

## Properties

| Property | Type | Constraints | Required | Description |
|----------|------|-------------|----------|-------------|
| `type` | `any` | - |  |  |
| `startDate` | `string (date)` | - |  | Program start date |
| `endDate` | `string (date)` | - |  | Program end date |
| `status` | `string` | enum: `planning`, `active`, `on-hold`, `completed`, `cancelled` | ✓ | Current program status |
| `budget` | `number` | min: 0 |  | Total program budget |
| `projects` | `string[]` | - | ✓ | Projects included in this program |
| `objectives` | `string[]` | - |  | Strategic objectives this program aims to achieve |
| `stakeholders` | `object[]` | - |  | Program stakeholders and their roles |

## Relationships

| Field | References | Description |
|-------|------------|-------------|
| `inherits` | `base` | Inherits from base |

## Examples

### Digital Transformation Initiative

```json
{
  "name": "Digital Transformation Initiative",
  "key": "digitalTransformation",
  "type": "Program",
  "description": "Comprehensive program to modernize lending processes through automation and digital channels",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "status": "active",
  "budget": 2500000,
  "projects": [
    "borrower-portal-enhancement",
    "automated-underwriting",
    "risk-assessment-modernization"
  ],
  "objectives": [
    "Reduce loan processing time by 50%",
    "Improve borrower satisfaction scores",
    "Increase automation rate to 80%"
  ],
  "stakeholders": [
    {
      "role": "program-manager",
      "actor": "john-doe"
    },
    {
      "role": "sponsor",
      "actor": "cto-role"
    }
  ]
}
```

