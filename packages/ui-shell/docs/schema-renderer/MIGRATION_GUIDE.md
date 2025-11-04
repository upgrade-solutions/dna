# DNA Schema Renderer - Migration Guide

## Using Your ui.json Schema

The `ui.json` file in the schemas directory is an excellent example. Here's how to use it with the DNA Schema Renderer system.

### Loading the Schema

```tsx
// 1. Import the schema file
import loanUISchema from '@/schemas/json/platform/application/ui/ui.json'

// 2. Cast it to UISchema type
import { UISchema } from '@/components/schema'
const schema = loanUISchema as UISchema

// 3. Use with any renderer
<FlowRenderer schema={schema} flow={schema.flows[0]} />
```

### Step-by-Step: From ui.json to UI

#### Step 1: Extract a Page
```tsx
const borrowerPage = schema.pages.find(p => p.key === 'borrowerInfo')
// Displays: Borrower Information form with name, email, phone fields
```

#### Step 2: Extract a Component
```tsx
const borrowerForm = schema.components.find(c => c.key === 'borrowerForm')
// Displays: Text fields for firstName, lastName, email, phone
```

#### Step 3: Extract a Flow
```tsx
const applicationFlow = schema.flows.find(f => f.key === 'applicationSubmissionFlow')
// Displays: Multi-step form with borrower info → loan details → review
```

### Component Mapping

The `ui.json` schema includes these reusable components:

| Component | Purpose | Fields |
|-----------|---------|--------|
| `borrowerForm` | Collect borrower info | firstName, lastName, email, phone |
| `loanForm` | Collect loan details | loanAmount, loanPurpose, loanTerm |
| `reviewComponent` | Display summary | Application summary for review |
| `confirmationComponent` | Show confirmation | Reference number & message |
| `loanStatusComponent` | Display status | Current application status |
| `applicationDetailsComponent` | Show details | Application ID, submission date |

### Page Structure

The `ui.json` defines these pages:

| Page | Purpose | Components | Layout |
|------|---------|-----------|--------|
| `borrowerInfo` | Collect borrower data | borrowerForm | Flexbox |
| `loanDetails` | Collect loan specs | loanForm | Flexbox |
| `review` | Review before submit | reviewComponent | Flexbox |
| `confirmation` | Success message | confirmationComponent | Flexbox |
| `loanDashboard` | View application | applicationDetails, loanStatus | Grid |

### Example: Display Specific Page

```tsx
import { resolvePage, resolveComponent } from '@/components/schema'
import loanSchema from '@/schemas/json/platform/application/ui/ui.json'

export function DisplayBorrowerPage() {
  const schema = loanSchema as UISchema
  const page = resolvePage(schema, 'borrower-info-page')
  
  if (!page) return <div>Page not found</div>
  
  return (
    <PageRenderer
      schema={schema}
      page={page}
      onComponentSubmit={(componentId, data) => {
        console.log(`Component ${componentId} submitted:`, data)
        // Save data and move to next step
      }}
    />
  )
}
```

### Example: Display Specific Form

```tsx
import { resolveComponent } from '@/components/schema'
import loanSchema from '@/schemas/json/platform/application/ui/ui.json'

export function DisplayLoanForm() {
  const schema = loanSchema as UISchema
  const loanForm = resolveComponent(schema, 'loan-form-component')
  
  if (!loanForm) return <div>Component not found</div>
  
  return (
    <ComponentRenderer
      component={loanForm}
      onSubmit={(data) => {
        console.log('Loan form submitted:', data)
        // Process loan data
      }}
    />
  )
}
```

### Example: Full Flow

```tsx
import { resolveFlow } from '@/components/schema'
import loanSchema from '@/schemas/json/platform/application/ui/ui.json'

export function LoanApplicationFlow() {
  const schema = loanSchema as UISchema
  const flow = resolveFlow(schema, 'application-submission-flow')
  
  if (!flow) return <div>Flow not found</div>
  
  return (
    <FlowRenderer
      schema={schema}
      flow={flow}
      onFlowComplete={(allData) => {
        console.log('Application submitted:', allData)
        // Submit to backend
        submitLoanApplication(allData)
      }}
      onStepChange={(stepId) => {
        console.log('Moved to step:', stepId)
        // Track analytics, etc.
      }}
    />
  )
}
```

## Schema References in ui.json

The `ui.json` uses several reference types:

### `$ref` References (Cross-schema)
```json
{
  "$ref": "https://dna.codes/schemas/application/ui/page.json"
}
```
Maps to: `PageDefinition` type

### Internal References (IDs)

**Page → Component references:**
```json
{
  "layout": {
    "containers": [
      {
        "components": [
          { "componentId": "borrower-form-component" }
        ]
      }
    ]
  }
}
```
Resolve with: `resolveComponent(schema, 'borrower-form-component')`

**Flow → Step → Page references:**
```json
{
  "steps": [
    {
      "pageId": "borrower-info-page",
      "componentId": "borrower-form-component"
    }
  ]
}
```
Resolve with: `resolvePage(schema, pageId)` and `resolveComponent(schema, componentId)`

## Extending the Schema

### Add a New Component

```tsx
const newComponent: ComponentDefinition = {
  id: 'employment-form-component',
  name: 'Employment Form',
  key: 'employmentForm',
  type: 'Component',
  description: 'Collect employment information',
  fields: [
    {
      id: 'employer-field',
      name: 'Employer',
      key: 'employer',
      type: 'Field',
      dataType: 'string',
      required: true
    },
    // ... more fields
  ],
  handlers: [
    {
      id: 'submit-handler',
      name: 'On Submit',
      key: 'onSubmit',
      type: 'EventHandler',
      action: 'submitEmploymentInfo',
      validation: true
    }
  ]
}

// Add to schema
const extendedSchema: UISchema = {
  ...schema,
  components: [...schema.components, newComponent]
}
```

### Add a New Step to Flow

```tsx
const newStep: StepDefinition = {
  id: 'employment-info-step',
  name: 'Employment Information',
  key: 'employmentInfo',
  type: 'Step',
  description: 'Provide employment details',
  pageId: 'employment-info-page',
  componentId: 'employment-form-component',
  action: 'collectEmploymentInfo',
  nextStep: 'review-step'
}

// Insert into flow
const updatedFlow = {
  ...flow,
  steps: [
    ...flow.steps.slice(0, 2),
    newStep,
    ...flow.steps.slice(2)
  ],
  transitions: [
    // Update transitions to point to new step
    {
      from: 'loan-details-step',
      to: 'employment-info-step',
      trigger: 'formSubmitted'
    },
    {
      from: 'employment-info-step',
      to: 'review-step',
      trigger: 'formSubmitted'
    }
  ]
}
```

## Validation with ui.json Schema

The validation rules defined in `ui.json` are automatically enforced:

```tsx
import { validateComponentData } from '@/components/schema'

const borrowerForm = schema.components[0] // borrowerForm
const data = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'invalid', // ❌ Invalid email format
  phone: '555-1234'
}

const result = validateComponentData(borrowerForm, data)
// result.valid === false
// result.errors[0] = {
//   field: 'email',
//   errors: ['Email Address must be a valid email']
// }
```

## Type Safety

Always import types for full TypeScript support:

```tsx
import {
  UISchema,
  PageDefinition,
  ComponentDefinition,
  FlowDefinition,
  FieldDefinition
} from '@/components/schema'

const schema: UISchema = loanSchema
const page: PageDefinition = schema.pages[0]
const component: ComponentDefinition = schema.components[0]
```

## Common Patterns

### Load and Cache Schema

```tsx
const schemaCache: Map<string, UISchema> = new Map()

export async function getSchema(schemaId: string): Promise<UISchema> {
  if (schemaCache.has(schemaId)) {
    return schemaCache.get(schemaId)!
  }
  
  const schema = (await import(`@/schemas/json/${schemaId}.json`)) as UISchema
  schemaCache.set(schemaId, schema)
  return schema
}
```

### Conditional Rendering

```tsx
export function DisplayComponent({ schema, componentKey }: Props) {
  const component = schema.components.find(c => c.key === componentKey)
  
  if (!component) {
    return <ErrorBoundary componentKey={componentKey} />
  }
  
  return <ComponentRenderer component={component} />
}
```

### Track Flow Progress

```tsx
export function FlowWithTracking() {
  const [stepIndex, setStepIndex] = useState(0)
  
  return (
    <FlowRenderer
      flow={flow}
      schema={schema}
      onStepChange={(stepId) => {
        const index = flow.steps.findIndex(s => s.id === stepId)
        setStepIndex(index)
        // Track: "user_progressed_to_step_2"
      }}
    />
  )
}
```

## Troubleshooting

### "Component not found" error
```tsx
// ❌ Wrong
<ComponentRenderer component={schema.components[0]} />

// ✅ Right - resolve by ID
const component = resolveComponent(schema, componentId)
<ComponentRenderer component={component} />
```

### Validation not working
- Check that field has `required: true` or validation rules
- Ensure field names match exactly (case-sensitive)
- Verify component has handler with `key: 'onSubmit'`

### Field not rendering
- Check `dataType` is one of: 'string', 'number', 'integer', 'boolean'
- If using enum, ensure `validation.enum` is an array
- Ensure field `key` is unique within component

---

Now you have a complete system for building dynamic UIs from DNA schemas!
