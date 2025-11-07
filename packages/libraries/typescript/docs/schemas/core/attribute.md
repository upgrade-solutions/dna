# Attribute

A key-value property that can be attached to resources, API endpoints, UI components, and other entities.

## Properties

| Property | Type | Constraints | Required | Description |
|----------|------|-------------|----------|-------------|
| `type` | `any` | - |  |  |
| `value` | `any` | - | ✓ | The value of the attribute. Can be of any type. |
| `dataType` | `string` | - |  | Optional type hint for the attribute value (e.g., 'string', 'number', 'boolean', 'date', 'url'). |
| `required` | `boolean` | - |  | Whether this attribute is required in the context where it's used. |
| `readonly` | `boolean` | - |  | Whether this attribute is read-only and cannot be modified. |
| `validation` | `object` | - |  | Optional validation rules for the attribute value. |
| `metadata` | `object` | - |  | Additional metadata about the attribute for API/UI contexts. |

## Relationships

| Field | References | Description |
|-------|------------|-------------|
| `inherits` | `base` | Inherits from base |

## Examples

### Annual Income

```json
{
  "name": "Annual Income",
  "key": "annualIncome",
  "type": "Attribute",
  "description": "Borrower's verified annual income",
  "value": 75000,
  "dataType": "number",
  "required": true,
  "validation": {
    "minimum": 0,
    "maximum": 10000000
  },
  "metadata": {
    "displayName": "Annual Income ($)",
    "category": "Financial Information",
    "order": 1
  }
}
```

### Employment Status

```json
{
  "name": "Employment Status",
  "key": "employmentStatus",
  "type": "Attribute",
  "description": "Current employment status of the borrower",
  "value": "full-time",
  "dataType": "string",
  "required": true,
  "validation": {
    "enum": [
      "full-time",
      "part-time",
      "self-employed",
      "unemployed",
      "retired"
    ]
  },
  "metadata": {
    "displayName": "Employment Status",
    "category": "Employment Information",
    "order": 2
  }
}
```

### Debt-to-Income Ratio

```json
{
  "name": "Debt-to-Income Ratio",
  "key": "debtToIncomeRatio",
  "type": "Attribute",
  "description": "Calculated ratio of monthly debt payments to monthly income",
  "value": 0.32,
  "dataType": "number",
  "readonly": true,
  "validation": {
    "minimum": 0,
    "maximum": 1
  },
  "metadata": {
    "displayName": "Debt-to-Income Ratio (%)",
    "category": "Financial Metrics",
    "order": 3,
    "apiOnly": true
  }
}
```

