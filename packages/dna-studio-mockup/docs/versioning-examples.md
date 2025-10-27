# Product Versioning in DNA Studio - Examples

This document demonstrates how to represent product changes from version 1.0.0 to 1.1.0 and beyond using the DNA Studio versioning system.

## Example 1: Minor Version Update (1.0.0 → 1.1.0)

### Before (Loan Platform v1.0.0)
```json
{
  "id": "1",
  "name": "Loan Platform",
  "description": "End-to-end loan origination and servicing platform",
  "version": "1.0.0",
  "versionHistory": [
    {
      "version": "1.0.0",
      "releaseDate": "2024-01-15",
      "description": "Initial release with core loan processing",
      "changes": [
        "Customer onboarding workflow",
        "Basic loan application process",
        "Payment processing system"
      ]
    }
  ],
  "workflows": ["wf1", "wf2", "wf3"],
  "status": "Active"
}
```

### After (Loan Platform v1.1.0)
```json
{
  "id": "1", 
  "name": "Loan Platform",
  "description": "End-to-end loan origination and servicing platform",
  "version": "1.1.0",
  "versionHistory": [
    {
      "version": "1.0.0",
      "releaseDate": "2024-01-15", 
      "description": "Initial release with core loan processing",
      "changes": [
        "Customer onboarding workflow",
        "Basic loan application process", 
        "Payment processing system"
      ]
    },
    {
      "version": "1.1.0",
      "releaseDate": "2024-03-20",
      "description": "Enhanced risk assessment and reporting capabilities",
      "changes": [
        "Automated risk profiling system",
        "Advanced analytics dashboard",
        "Collections workflow planning",
        "Enhanced document verification"
      ]
    }
  ],
  "workflows": ["wf1", "wf2", "wf3", "wf4", "wf5"],
  "status": "Active"
}
```

## Example 2: Major Version Update (1.5.2 → 2.0.0)

### Banking Core System Evolution
```json
{
  "id": "2",
  "name": "Banking Core",
  "description": "Core banking system with account management", 
  "version": "2.0.0",
  "versionHistory": [
    {
      "version": "1.0.0",
      "releaseDate": "2023-06-01",
      "description": "Initial core banking system release",
      "changes": [
        "Basic account management",
        "Transaction processing",
        "Customer profiles"
      ]
    },
    {
      "version": "1.5.0",
      "releaseDate": "2023-09-15",
      "description": "Enhanced security and audit features",
      "changes": [
        "Two-factor authentication",
        "Audit logging system", 
        "Fraud detection alerts"
      ]
    },
    {
      "version": "1.5.2",
      "releaseDate": "2023-11-20",
      "description": "Performance improvements and bug fixes",
      "changes": [
        "Database query optimization",
        "Memory usage improvements",
        "UI responsiveness fixes"
      ]
    },
    {
      "version": "2.0.0",
      "releaseDate": "2024-01-10",
      "description": "Complete architecture overhaul with microservices",
      "changes": [
        "Microservices architecture migration",
        "Enhanced security framework",
        "Real-time processing engine",
        "New API contracts",
        "Cloud-native deployment"
      ],
      "breakingChanges": [
        "Legacy API endpoints deprecated",
        "Database schema restructured", 
        "Authentication system updated",
        "Configuration format changed"
      ]
    }
  ]
}
```

## Example 3: Project-Level Versioning

Projects within products can also have their own version evolution:

```json
{
  "id": "2",
  "name": "Loan Application",
  "status": "Develop", 
  "version": "1.1.0",
  "versionHistory": [
    {
      "version": "1.0.0",
      "releaseDate": "2024-01-20",
      "description": "Basic loan application workflow implementation",
      "changes": [
        "Application form validation",
        "Credit score integration",
        "Basic document upload"
      ]
    },
    {
      "version": "1.1.0", 
      "releaseDate": "2024-03-20",
      "description": "Enhanced automation and risk assessment",
      "changes": [
        "Automated risk assessment engine",
        "Enhanced document verification with OCR",
        "Real-time application status updates",
        "Integration with external credit bureaus"
      ]
    }
  ],
  "workflowIds": ["wf2"],
  "productId": "1"
}
```

## Example 4: Workflow-Level Changes

Individual workflows can track changes between product versions:

```json
{
  "id": "wf2",
  "name": "Loan Application",
  "description": "Loan request submission and processing",
  "version": "1.1.0",
  "status": "Active",
  "productId": "1",
  "versionChanges": {
    "1.0.0": {
      "description": "Initial workflow implementation",
      "steps": ["s5", "s6", "s7", "s9"],
      "releaseDate": "2024-01-20"
    },
    "1.1.0": {
      "description": "Added automated risk assessment",
      "addedSteps": ["s8"],
      "modifiedSteps": ["s6", "s7"],
      "changes": [
        "Enhanced credit score checking with multiple bureaus",
        "Automated risk profiling added",
        "Document verification improved with OCR"
      ],
      "releaseDate": "2024-03-20"
    }
  }
}
```

## Version Badge Color Coding

The UI uses semantic color coding for version types:

- **Major** (2.0.0): Red - Breaking changes, significant new features
- **Minor** (1.1.0): Blue - New features, backward compatible
- **Patch** (1.0.1): Green - Bug fixes, minor improvements
- **Initial** (1.0.0): Purple - First release

## Version Management Workflow

1. **Planning**: Identify changes and determine version type
2. **Implementation**: Make changes to workflows, steps, or resources
3. **Documentation**: Update version history with detailed changes
4. **Release**: Deploy new version and update product metadata
5. **Migration**: Handle any data or configuration migrations needed

## Breaking Change Management

For major version updates that include breaking changes:

```json
{
  "version": "2.0.0",
  "breakingChanges": [
    "API endpoint /v1/loans deprecated, use /v2/loans",
    "LoanRequest schema changed - added required 'riskProfile' field",
    "Authentication now requires OAuth 2.0 instead of API keys"
  ],
  "migrationGuide": {
    "steps": [
      "Update API endpoints to v2",
      "Add riskProfile to all loan requests", 
      "Migrate to OAuth 2.0 authentication"
    ],
    "estimatedTime": "2-4 hours",
    "supportedUntil": "2024-12-31"
  }
}
```

This versioning system provides clear visibility into product evolution while maintaining compatibility and migration paths for users.