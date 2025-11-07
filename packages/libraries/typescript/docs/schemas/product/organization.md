# Organization

The top-level entity that owns multiple products and encompasses all business operations.

## Properties

| Property | Type | Constraints | Required | Description |
|----------|------|-------------|----------|-------------|
| `type` | `any` | - |  |  |
| `domain` | `string` | - | ✓ | Primary business domain or industry sector of the organization |
| `products` | `string[]` | - |  | List of product keys owned by this organization |
| `metadata` | `object` | - |  | Additional organizational metadata |

## Relationships

| Field | References | Description |
|-------|------------|-------------|
| `inherits` | `base` | Inherits from base |

## Examples

### Upgrade Solutions Inc.

```json
{
  "name": "Upgrade Solutions Inc.",
  "key": "upgradeSolutions",
  "type": "Organization",
  "description": "Financial technology company providing lending and payment solutions",
  "domain": "finance",
  "products": [
    "loan-origination-system",
    "payments-platform",
    "customer-portal"
  ],
  "metadata": {
    "industry": "Financial Services",
    "founded": "2012",
    "headquarters": "San Francisco, CA",
    "size": "enterprise"
  }
}
```

### ACME Corporation

```json
{
  "name": "ACME Corporation",
  "key": "acmeCorp",
  "type": "Organization",
  "description": "Multi-industry conglomerate with diverse business operations",
  "domain": "manufacturing",
  "products": [
    "supply-chain-management",
    "quality-control-system",
    "inventory-management"
  ],
  "metadata": {
    "industry": "Manufacturing",
    "founded": "1950",
    "headquarters": "Detroit, MI",
    "size": "large"
  }
}
```

