# Organization Schema

Defines an organization — the top-level entity that owns multiple products and encompasses all business operations.

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

