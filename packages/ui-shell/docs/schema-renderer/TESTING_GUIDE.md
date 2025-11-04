# DNA Schema Renderer - Testing Guide

## Testing Strategy

### Unit Tests

Test individual functions in isolation:

```tsx
import { validateField, validateComponentData } from '@/components/schema'

describe('Validators', () => {
  describe('validateField', () => {
    it('should validate required fields', () => {
      const field = {
        id: 'name',
        name: 'Name',
        key: 'name',
        type: 'Field',
        dataType: 'string',
        required: true
      }

      const result = validateField(field, '')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Name is required')
    })

    it('should validate email format', () => {
      const field = {
        id: 'email',
        name: 'Email',
        key: 'email',
        type: 'Field',
        dataType: 'string',
        validation: { format: 'email' }
      }

      const validResult = validateField(field, 'test@example.com')
      expect(validResult.valid).toBe(true)

      const invalidResult = validateField(field, 'invalid')
      expect(invalidResult.valid).toBe(false)
    })

    it('should validate number ranges', () => {
      const field = {
        id: 'amount',
        name: 'Amount',
        key: 'amount',
        type: 'Field',
        dataType: 'number',
        validation: { minimum: 100, maximum: 1000 }
      }

      expect(validateField(field, 50).valid).toBe(false) // Too low
      expect(validateField(field, 500).valid).toBe(true) // OK
      expect(validateField(field, 1500).valid).toBe(false) // Too high
    })

    it('should validate enum values', () => {
      const field = {
        id: 'purpose',
        name: 'Loan Purpose',
        key: 'purpose',
        type: 'Field',
        dataType: 'string',
        validation: { enum: ['home', 'auto', 'personal'] }
      }

      expect(validateField(field, 'home').valid).toBe(true)
      expect(validateField(field, 'boat').valid).toBe(false)
    })
  })

  describe('validateComponentData', () => {
    it('should validate entire component form', () => {
      const component = {
        id: 'form',
        name: 'Form',
        key: 'form',
        type: 'Component',
        fields: [
          {
            id: 'firstName',
            name: 'First Name',
            key: 'firstName',
            type: 'Field',
            dataType: 'string',
            required: true
          },
          {
            id: 'email',
            name: 'Email',
            key: 'email',
            type: 'Field',
            dataType: 'string',
            validation: { format: 'email' },
            required: true
          }
        ]
      }

      const invalidData = { firstName: 'John', email: 'invalid' }
      const result = validateComponentData(component, invalidData)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('email')
    })
  })
})
```

### Resolver Tests

```tsx
import { resolveComponent, resolvePage, getPageComponents } from '@/components/schema'
import { sampleLoanApplicationSchema } from '@/app/schema-demo/sample-schema'

describe('Resolvers', () => {
  const schema = sampleLoanApplicationSchema

  it('should resolve component by ID', () => {
    const component = resolveComponent(schema, 'borrower-form-component')
    expect(component).toBeDefined()
    expect(component?.name).toBe('Borrower Form')
  })

  it('should resolve page by ID', () => {
    const page = resolvePage(schema, 'borrower-info-page')
    expect(page).toBeDefined()
    expect(page?.name).toBe('Borrower Information')
  })

  it('should get all components used on a page', () => {
    const page = resolvePage(schema, 'borrower-info-page')!
    const components = getPageComponents(schema, page)

    expect(components).toHaveLength(1)
    expect(components[0].key).toBe('borrowerForm')
  })

  it('should handle non-existent IDs gracefully', () => {
    const component = resolveComponent(schema, 'non-existent')
    expect(component).toBeUndefined()
  })
})
```

### Component Integration Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentRenderer } from '@/components/schema'
import { sampleLoanApplicationSchema } from '@/app/schema-demo/sample-schema'

describe('ComponentRenderer', () => {
  it('should render form fields', () => {
    const component = sampleLoanApplicationSchema.components[0]

    render(
      <ComponentRenderer
        component={component}
        onSubmit={jest.fn()}
      />
    )

    expect(screen.getByLabelText(/First Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
  })

  it('should show validation errors on submit', async () => {
    const component = sampleLoanApplicationSchema.components[0]
    const onSubmit = jest.fn()

    render(
      <ComponentRenderer
        component={component}
        onSubmit={onSubmit}
      />
    )

    // Submit empty form
    fireEvent.click(screen.getByText(/Submit/))

    // Should show errors
    expect(await screen.findByText(/First Name is required/)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('should call onSubmit with valid data', async () => {
    const component = sampleLoanApplicationSchema.components[0]
    const onSubmit = jest.fn()

    render(
      <ComponentRenderer
        component={component}
        onSubmit={onSubmit}
      />
    )

    // Fill form
    fireEvent.change(screen.getByLabelText(/First Name/), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/Last Name/), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '555-1234' } })

    // Submit
    fireEvent.click(screen.getByText(/Submit/))

    // Should call onSubmit
    expect(onSubmit).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-1234'
    })
  })
})
```

### Flow Integration Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { FlowRenderer } from '@/components/schema'
import { sampleLoanApplicationSchema } from '@/app/schema-demo/sample-schema'

describe('FlowRenderer', () => {
  const schema = sampleLoanApplicationSchema
  const flow = schema.flows[0]

  it('should render first step', () => {
    render(
      <FlowRenderer
        schema={schema}
        flow={flow}
        onFlowComplete={jest.fn()}
      />
    )

    expect(screen.getByText(/Step 1 of 3/)).toBeInTheDocument()
    expect(screen.getByText(/Borrower Information/)).toBeInTheDocument()
  })

  it('should navigate between steps', async () => {
    const onStepChange = jest.fn()

    render(
      <FlowRenderer
        schema={schema}
        flow={flow}
        onFlowComplete={jest.fn()}
        onStepChange={onStepChange}
      />
    )

    // Fill first form
    fireEvent.change(screen.getByLabelText(/First Name/), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/Last Name/), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '555-1234' } })

    // Submit to go to next step
    fireEvent.click(screen.getByText(/Submit/))

    // Should change step
    expect(onStepChange).toHaveBeenCalled()
    expect(await screen.findByText(/Step 2 of 3/)).toBeInTheDocument()
  })

  it('should show progress indicator', () => {
    render(
      <FlowRenderer
        schema={schema}
        flow={flow}
        onFlowComplete={jest.fn()}
      />
    )

    // Should have progress bars (one for each step)
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars).toHaveLength(3)

    // First should be active
    expect(progressBars[0]).toHaveClass('bg-primary')
  })

  it('should call onFlowComplete when finished', async () => {
    const onFlowComplete = jest.fn()

    render(
      <FlowRenderer
        schema={schema}
        flow={flow}
        onFlowComplete={onFlowComplete}
      />
    )

    // Go through all steps...
    // (Fill form, submit, repeat for each step)
    // Last step should have isEnd: true

    // After final submission
    expect(onFlowComplete).toHaveBeenCalledWith(expect.any(Object))
  })

  it('should navigate backwards', () => {
    render(
      <FlowRenderer
        schema={schema}
        flow={flow}
        onFlowComplete={jest.fn()}
      />
    )

    // Previous button should be disabled on first step
    const prevButton = screen.getByText(/Previous/)
    expect(prevButton).toBeDisabled()

    // After moving to second step
    // Previous button should be enabled
  })
})
```

## Manual Testing Checklist

### Basic Functionality
- [ ] Visit `/schema-demo` page loads
- [ ] Form displays all fields
- [ ] Field validation shows errors on submit
- [ ] Valid form submission works
- [ ] Navigation between steps works
- [ ] Progress indicator updates
- [ ] Previous button disabled on first step
- [ ] Flow completes successfully

### Validation Testing
- [ ] Required fields show errors when empty
- [ ] Email field validates email format
- [ ] Number fields accept only numbers
- [ ] Number range validation works (min/max)
- [ ] Select/enum fields show correct options
- [ ] Error messages are clear

### UI/UX Testing
- [ ] Form is responsive on mobile
- [ ] Error messages are visible
- [ ] Submit button shows loading state
- [ ] Navigation buttons are accessible
- [ ] Progress bar accurately represents progress
- [ ] Keyboard navigation works (Tab, Enter)

### Edge Cases
- [ ] Rapid form submission (debounced)
- [ ] Very long form field values
- [ ] Special characters in inputs
- [ ] Copy/paste into form fields
- [ ] Browser autofill integration
- [ ] Network errors during submission

## Performance Testing

```tsx
// Measure render time for large forms
import { render } from '@testing-library/react'
import { performance } from 'perf_hooks'

it('should render large form efficiently', () => {
  const largeComponent = {
    id: 'large-form',
    name: 'Large Form',
    key: 'largeForm',
    type: 'Component',
    fields: Array.from({ length: 100 }, (_, i) => ({
      id: `field-${i}`,
      name: `Field ${i}`,
      key: `field${i}`,
      type: 'Field',
      dataType: 'string'
    }))
  }

  const start = performance.now()
  render(<ComponentRenderer component={largeComponent} />)
  const end = performance.now()

  expect(end - start).toBeLessThan(1000) // Should render in < 1s
})
```

## Accessibility Testing

```tsx
import { render, screen } from '@testing-library/react'
import axe from 'jest-axe'

it('should not have accessibility violations', async () => {
  const { container } = render(
    <ComponentRenderer
      component={borrowerForm}
      onSubmit={jest.fn()}
    />
  )

  const results = await axe(container)
  expect(results).toHaveNoViolations()
})

it('should have proper labels for all inputs', () => {
  render(
    <ComponentRenderer
      component={borrowerForm}
      onSubmit={jest.fn()}
    />
  )

  screen.getAllByRole('textbox').forEach(input => {
    expect(input).toHaveAccessibleName()
  })
})
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- components/schema/validators.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

This testing guide ensures the schema renderer system is robust, performant, and accessible.
