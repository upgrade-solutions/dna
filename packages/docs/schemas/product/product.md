# Product Schema

Defines a product — a long-lived structure representing a major business offering or system within an organization.

## Examples

### Loan Origination System

```json
{
  "name": "Loan Origination System",
  "key": "loanOriginationSystem",
  "type": "Product",
  "description": "Comprehensive platform for managing the entire loan application and approval process",
  "organization": "upgrade-solutions-inc",
  "status": "active",
  "version": "2.1.0",
  "workflows": [
    "loan-application-workflow",
    "underwriting-workflow",
    "loan-servicing-workflow"
  ],
  "owners": [
    {
      "role": "Product Manager",
      "actor": "product-manager-loans"
    },
    {
      "role": "Technical Lead",
      "actor": "tech-lead-backend"
    }
  ],
  "integrations": [
    "credit-bureau-api",
    "payment-processor",
    "document-management-system"
  ],
  "metadata": {
    "category": "Financial Services",
    "businessUnit": "Lending",
    "compliance": [
      "SOX",
      "PCI-DSS",
      "GDPR"
    ],
    "supportLevel": "enterprise",
    "deploymentModel": "cloud"
  }
}
```

### Payments Platform

```json
{
  "name": "Payments Platform",
  "key": "paymentsplatform",
  "type": "Product",
  "description": "Secure payment processing platform supporting multiple payment methods and currencies",
  "organization": "upgrade-solutions-inc",
  "status": "active",
  "version": "3.0.2",
  "workflows": [
    "payment-processing-workflow",
    "refund-workflow",
    "fraud-detection-workflow"
  ],
  "owners": [
    {
      "role": "Product Manager",
      "actor": "product-manager-payments"
    }
  ],
  "integrations": [
    "stripe-api",
    "paypal-api",
    "bank-networks"
  ],
  "metadata": {
    "category": "Financial Services",
    "businessUnit": "Payments",
    "compliance": [
      "PCI-DSS",
      "SOX"
    ],
    "supportLevel": "mission-critical",
    "deploymentModel": "hybrid"
  }
}
```

