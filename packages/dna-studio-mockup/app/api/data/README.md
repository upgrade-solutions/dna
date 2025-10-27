# DNA Studio Data Organization

This directory contains the reorganized data structure for DNA Studio, where each organization's complete DNA (products, workflows, steps, projects, and resource schemas) is contained in a single file.

## Structure

### `/organizations/` 
Contains individual organization data files:
- `financial-services-division.json` - Complete DNA for Financial Services Division (org1)
- `audiobook-distribution.json` - Complete DNA for Audiobook Distribution (org2)

Each organization file contains:
- **organization**: Basic organization info (id, name, description)
- **products**: All products belonging to this organization
- **workflows**: All workflows across all products for this organization
- **steps**: All steps across all workflows for this organization
- **projects**: All projects across all products for this organization
- **resourceSchemas**: All resource type schemas used by this organization

### `config.json`
Global configuration containing:
- **organizations**: List of all organizations with references to their data files
- **statusColors**: UI styling for different status types (shared across all organizations)

## Benefits of New Structure

1. **Organization Isolation**: Each organization's data is completely separate and self-contained
2. **Easier Management**: All related data for an organization is in one place
3. **Better Scalability**: Adding new organizations doesn't affect existing ones
4. **Simpler Backups**: Can backup/restore individual organization data
5. **Clearer Dependencies**: Resource schemas are co-located with the data that uses them

## Migration Notes

The `data.ts` utility file has been updated to:
- Load organization data from individual files
- Maintain the same public API for backwards compatibility
- Add new helper functions like `getOrganizationData()`
- Merge schemas from all organizations for global schema access

## Data Structure

### Organization Files
```json
{
  "organization": { "id": "string", "name": "string", "description": "string" },
  "products": [{ "id": "string", "name": "string", "organizationId": "string", ... }],
  "workflows": [{ "id": "string", "name": "string", "productId": "string", ... }],
  "steps": [{ "id": "string", "actor": "string", "action": "string", "resource": "string", "workflowId": "string", ... }],
  "projects": [{ "id": "string", "name": "string", "productId": "string", "workflowIds": ["string"], ... }],
  "resourceSchemas": { "ResourceType": { "attributes": [...], "validations": [...] } }
}
```

## Usage

The public API remains the same:
```typescript
import { getOrganizations, getProducts, getProductsByOrganization, getOrganizationData } from './data'

// Get all organizations
const orgs = getOrganizations()

// Get all products (across all organizations)
const products = getProducts()

// Get products for specific organization
const orgProducts = getProductsByOrganization('org1')

// Get organization-specific data
const orgData = getOrganizationData('org1')
```

## Legacy Files (Deprecated)

The following files have been replaced by the new organization-based structure:
- `organizations.json` → `config.json` (organizations list)
- `products.json` → `organizations/*.json` (products by org)
- `workflows.json` → `organizations/*.json` (workflows by org)
- `steps.json` → `organizations/*.json` (steps by org)
- `projects.json` → `organizations/*.json` (projects by org)
- `form-schemas.json` → `organizations/*.json` (resourceSchemas by org)
- `status-colors.json` → `config.json` (statusColors)