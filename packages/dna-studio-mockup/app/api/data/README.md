# DNA Studio Mockup Data

This directory contains the structured data used by the DNA Studio mockup application. The data was extracted from the React component and organized into separate JSON files for better maintainability and potential API development.

## Files

### Core Data Models
- `organizations.json` - Organization entities with descriptions
- `products.json` - Product definitions linked to organizations  
- `workflows.json` - Workflow definitions linked to products
- `steps.json` - Individual workflow steps (Actor-Action-Resource pattern)
- `projects.json` - Project definitions with status and workflow associations

### Supporting Data
- `status-colors.json` - UI color mappings for different status types
- `form-schemas.json` - Form validation schemas for different resource types

## Data Structure

### Organizations
```json
{
  "id": "string",
  "name": "string", 
  "description": "string"
}
```

### Products
```json
{
  "id": "string",
  "name": "string",
  "description": "string", 
  "projectCount": "number",
  "workflowCount": "number",
  "status": "Active|Planning|Archived",
  "organizationId": "string"
}
```

### Workflows
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "status": "Active|Planned|Deprecated|In Review",
  "productId": "string"
}
```

### Steps (DNA Pattern: Actor-Action-Resource)
```json
{
  "id": "string",
  "actor": "string",    // Who performs the action
  "action": "string",   // What operation is performed  
  "resource": "string", // What data entity is involved
  "status": "Active|Planned|Deprecated|In Review",
  "workflowId": "string"
}
```

### Projects
```json
{
  "id": "string",
  "name": "string",
  "status": "Discover|Design|Develop|Deliver",
  "workflowIds": ["string"],
  "productId": "string"
}
```

## Relationships

- Organizations → Products (1:many)
- Products → Workflows (1:many)  
- Products → Projects (1:many)
- Workflows → Steps (1:many)
- Projects → Workflows (many:many)

## Usage

These JSON files can be used to:
- Replace hardcoded data in React components
- Seed a backend database
- Generate API responses
- Create test data for development
- Mock data for Storybook components
- Generate documentation
- Import into other systems

The data represents a financial services domain with loan origination workflows as the primary example.

## Integration with React Components

You can import this data directly into your React components:

```typescript
import organizations from '../data/organizations.json';
import products from '../data/products.json';
import workflows from '../data/workflows.json';
import steps from '../data/steps.json';
import projects from '../data/projects.json';
import formSchemas from '../data/form-schemas.json';
import statusColors from '../data/status-colors.json';
```

This approach allows for easier data management and potential future migration to a backend API.