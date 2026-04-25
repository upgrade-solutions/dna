import { DnaValidator } from './validator'

const validator = new DnaValidator()

// Shared inline fixtures for cross-layer tests. Intentionally minimal but
// wired end-to-end so the baseline "passes for valid DNA" case holds; each
// test spreads and overrides what it needs to exercise a specific error path.
const operationalFixture = {
  domain: {
    name: 'lending',
    path: 'acme.finance.lending',
    resources: [
      {
        name: 'Loan',
        attributes: [
          { name: 'id', type: 'string', required: true },
          { name: 'borrower_id', type: 'reference', resource: 'Borrower' },
        ],
        actions: [{ name: 'Apply' }, { name: 'Approve' }, { name: 'View' }, { name: 'List' }],
      },
      {
        name: 'Borrower',
        attributes: [{ name: 'id', type: 'string', required: true }],
        actions: [],
      },
      { name: 'Underwriter' },
      { name: 'LendingManager' },
      { name: 'BankDepartment' },
    ],
  },
  operations: [
    { resource: 'Loan', action: 'Apply', name: 'Loan.Apply' },
    { resource: 'Loan', action: 'Approve', name: 'Loan.Approve' },
    { resource: 'Loan', action: 'View', name: 'Loan.View' },
  ],
  triggers: [{ operation: 'Loan.Apply', source: 'user' }],
  outcomes: [
    {
      operation: 'Loan.Approve',
      changes: [{ attribute: 'loan.status', set: 'active' }],
      emits: ['lending.Loan.Disbursed'],
    },
  ],
  signals: [
    {
      name: 'lending.Loan.Disbursed',
      operation: 'Loan.Approve',
      payload: [{ name: 'loan_id', type: 'string' }],
    },
  ],
  relationships: [
    {
      name: 'Loan.borrower',
      from: 'Loan',
      to: 'Borrower',
      cardinality: 'many-to-one',
      attribute: 'borrower_id',
    },
  ],
} as any

const productApiFixture = {
  namespace: { name: 'Lending', path: '/lending' },
  resources: [
    {
      name: 'Loan',
      resource: 'Loan',
      fields: [],
      actions: [
        { name: 'Approve', action: 'Approve' },
        { name: 'View', action: 'View' },
      ],
    },
  ],
  operations: [
    { name: 'Loan.Approve', resource: 'Loan', action: 'Approve' },
    { name: 'Loan.View', resource: 'Loan', action: 'View' },
  ],
  endpoints: [
    { method: 'POST', path: '/loans/:id/approve', operation: 'Loan.Approve' },
    { method: 'GET', path: '/loans/:id', operation: 'Loan.View' },
  ],
} as any

const productUiFixture = {
  layout: { name: 'AppLayout', type: 'sidebar' },
  pages: [
    {
      name: 'LoanList',
      resource: 'Loan',
      blocks: [{ name: 'LB', type: 'list', operation: 'Loan.View' }],
    },
  ],
  routes: [{ path: '/loans', page: 'LoanList' }],
} as any

const technicalFixture = {
  providers: [{ name: 'aws', type: 'cloud', region: 'us-east-1' }],
  constructs: [
    { name: 'primary-db', type: 'database', category: 'storage', provider: 'aws' },
  ],
  cells: [
    {
      name: 'api',
      dna: 'product/api',
      adapter: { type: 'node/express' },
      constructs: ['primary-db'],
    },
  ],
} as any

const productCoreFixture = {
  domain: { name: 'lending', path: 'acme.finance.lending' },
  resources: [
    {
      name: 'Loan',
      attributes: [{ name: 'id', type: 'string' }],
      actions: [{ name: 'Approve' }, { name: 'View' }],
    },
    { name: 'Borrower', attributes: [{ name: 'id', type: 'string' }], actions: [] },
  ],
  operations: [
    { resource: 'Loan', action: 'Approve', name: 'Loan.Approve' },
    { resource: 'Loan', action: 'View', name: 'Loan.View' },
  ],
} as any

describe('DnaValidator — operational/resource', () => {
  it('validates a valid Resource document', () => {
    const doc = {
      name: 'Loan',
      description: 'A financial loan issued to a borrower.',
      domain: 'acme.finance.lending',
      attributes: [
        { name: 'amount', type: 'number', required: true },
        { name: 'status', type: 'enum', required: true, values: ['pending', 'active', 'repaid', 'defaulted'] }
      ],
      actions: [{ name: 'Apply' }, { name: 'Approve' }]
    }
    const result = validator.validate(doc, 'operational/resource')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('validates a Resource acting as a Role (with scope)', () => {
    const result = validator.validate({
      name: 'Father',
      scope: 'Family',
    }, 'operational/resource')
    expect(result.valid).toBe(true)
  })

  it('validates a Resource acting as a User (with memberships)', () => {
    const result = validator.validate({
      name: 'JoeKleier',
      memberships: [
        { role: 'Father', in: 'Family' },
        { role: 'Husband', in: 'Marriage' },
      ],
    }, 'operational/resource')
    expect(result.valid).toBe(true)
  })

  it('rejects a Resource missing required name field', () => {
    const result = validator.validate({ domain: 'acme.finance' }, 'operational/resource')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'name')).toBe(true)
  })

  it('rejects an Attribute with enum type but no values', () => {
    const doc = {
      name: 'Order',
      attributes: [{ name: 'status', type: 'enum' }]
    }
    const result = validator.validate(doc, 'operational/resource')
    expect(result.valid).toBe(false)
  })
})

describe('DnaValidator — operational/operation', () => {
  it('validates a valid Operation', () => {
    const result = validator.validate({ resource: 'Loan', action: 'Approve', name: 'Loan.Approve' }, 'operational/operation')
    expect(result.valid).toBe(true)
  })

  it('rejects an Operation missing action', () => {
    const result = validator.validate({ resource: 'Loan' }, 'operational/operation')
    expect(result.valid).toBe(false)
  })
})

describe('DnaValidator — operational/task', () => {
  it('validates a valid Task', () => {
    const result = validator.validate({
      name: 'close-loan',
      actor: 'ClosingSpecialist',
      operation: 'Loan.Close',
      description: 'Closing specialist closes an approved loan.'
    }, 'operational/task')
    expect(result.valid).toBe(true)
  })

  it('rejects a Task missing required operation', () => {
    const result = validator.validate({ name: 'close-loan', actor: 'ClosingSpecialist' }, 'operational/task')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'operation')).toBe(true)
  })
})

describe('DnaValidator — operational/process', () => {
  it('validates a valid Process', () => {
    const result = validator.validate({
      name: 'LoanOrigination',
      operator: 'LendingManager',
      startStep: 'intake',
      steps: [
        { id: 'intake', task: 'intake-loan' },
        { id: 'underwrite', task: 'underwrite-loan', depends_on: ['intake'] },
        { id: 'close', task: 'close-loan', depends_on: ['underwrite'], conditions: ['LoanIsApproved'], else: 'abort' }
      ]
    }, 'operational/process')
    expect(result.valid).toBe(true)
  })

  it('rejects a Process with no steps', () => {
    const result = validator.validate({
      name: 'EmptyProcess',
      operator: 'Manager',
      startStep: 'x',
      steps: []
    }, 'operational/process')
    expect(result.valid).toBe(false)
  })

  it('rejects a Process missing required operator', () => {
    const result = validator.validate({
      name: 'NoOperator',
      startStep: 'step-one',
      steps: [{ id: 'step-one', task: 'some-task' }]
    }, 'operational/process')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'operator')).toBe(true)
  })

  it('rejects a Process missing required startStep', () => {
    const result = validator.validate({
      name: 'NoStart',
      operator: 'Manager',
      steps: [{ id: 'step-one', task: 'some-task' }]
    }, 'operational/process')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'startStep')).toBe(true)
  })
})

describe('DnaValidator — operational/trigger', () => {
  it('validates a Trigger targeting an Operation with user source', () => {
    const result = validator.validate({
      operation: 'Loan.Apply',
      source: 'user'
    }, 'operational/trigger')
    expect(result.valid).toBe(true)
  })

  it('validates a Trigger targeting a Process with webhook source', () => {
    const result = validator.validate({
      process: 'LoanOrigination',
      source: 'webhook',
      event: 'crm.lead.qualified'
    }, 'operational/trigger')
    expect(result.valid).toBe(true)
  })

  it('rejects a Trigger missing both operation and process', () => {
    const result = validator.validate({ source: 'user' }, 'operational/trigger')
    expect(result.valid).toBe(false)
  })

  it('rejects a Trigger with both operation and process', () => {
    const result = validator.validate({
      operation: 'Loan.Apply',
      process: 'LoanOrigination',
      source: 'user'
    }, 'operational/trigger')
    expect(result.valid).toBe(false)
  })

  it('rejects a Trigger with signal source but missing signal field', () => {
    const result = validator.validate({
      operation: 'PaymentSchedule.Create',
      source: 'signal'
    }, 'operational/trigger')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'signal')).toBe(true)
  })
})

describe('DnaValidator — product/core/resource', () => {
  it('validates a valid Resource document', () => {
    const result = validator.validate({
      name: 'Loan',
      resource: 'Loan',
      description: 'A financial loan.',
      fields: [
        { name: 'amount', type: 'number', label: 'Amount', required: true },
        { name: 'status', type: 'enum', label: 'Status', values: ['pending', 'active'] }
      ],
      actions: [{ name: 'Apply', action: 'Apply' }]
    }, 'product/core/resource')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects a Resource missing required name', () => {
    const result = validator.validate({ resource: 'Loan' }, 'product/core/resource')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'name')).toBe(true)
  })

  it('rejects a Field with enum type but no values', () => {
    const result = validator.validate({
      name: 'Loan',
      fields: [{ name: 'status', type: 'enum' }]
    }, 'product/core/resource')
    expect(result.valid).toBe(false)
  })
})

describe('DnaValidator — product/core/operation', () => {
  it('validates a valid Operation', () => {
    const result = validator.validate({
      resource: 'Loan',
      action: 'Approve',
      name: 'Loan.Approve'
    }, 'product/core/operation')
    expect(result.valid).toBe(true)
  })

  it('rejects an Operation missing action', () => {
    const result = validator.validate({ resource: 'Loan' }, 'product/core/operation')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'action')).toBe(true)
  })
})

describe('DnaValidator — product/api/endpoint', () => {
  it('validates a valid Endpoint', () => {
    const result = validator.validate({
      method: 'POST',
      path: '/loans/:id/approve',
      operation: 'Loan.Approve',
      params: [{ name: 'loan_id', in: 'path', type: 'string', required: true }]
    }, 'product/api/endpoint')
    expect(result.valid).toBe(true)
  })

  it('rejects an Endpoint missing path', () => {
    const result = validator.validate({ method: 'GET', operation: 'Loan.View' }, 'product/api/endpoint')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'path')).toBe(true)
  })
})

describe('DnaValidator — product/web/page', () => {
  it('validates a valid Page', () => {
    const result = validator.validate({
      name: 'LoanDetail',
      resource: 'Loan',
      blocks: [{ name: 'LoanHeader', type: 'detail', operation: 'Loan.View' }]
    }, 'product/web/page')
    expect(result.valid).toBe(true)
  })
})

describe('DnaValidator — technical/construct', () => {
  it('validates a valid Construct', () => {
    const result = validator.validate({
      name: 'primary-db',
      category: 'storage',
      type: 'database',
      provider: 'aws',
      config: { engine: 'postgres', version: '15' }
    }, 'technical/construct')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects a Construct missing type', () => {
    const result = validator.validate({ name: 'primary-db', category: 'storage' }, 'technical/construct')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'type')).toBe(true)
  })
})

describe('DnaValidator — technical/cell', () => {
  it('validates a valid Cell', () => {
    const result = validator.validate({
      name: 'api',
      dna: 'product/api',
      adapter: { type: 'nestjs', version: '10' },
      constructs: ['primary-db', 'auth-provider']
    }, 'technical/cell')
    expect(result.valid).toBe(true)
  })

  it('rejects a Cell missing adapter', () => {
    const result = validator.validate({ name: 'api', dna: 'product/api' }, 'technical/cell')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'adapter')).toBe(true)
  })

  it('validates a Cell with variables and outputs', () => {
    const result = validator.validate({
      name: 'db',
      dna: 'operational/loan',
      adapter: { type: 'postgres', version: '15' },
      constructs: ['primary-db'],
      variables: [{ name: 'DATABASE_URL', source: 'secret', value: 'arn:aws:secretsmanager:us-east-1:123:secret:db-url' }],
      outputs: [{ name: 'db.connection_string', cell: 'db', value: 'primary-db.connection_string' }]
    }, 'technical/cell')
    expect(result.valid).toBe(true)
  })
})

describe('DnaValidator — technical/environment', () => {
  it('validates a valid Environment', () => {
    const result = validator.validate({
      name: 'prod',
      description: 'Live production environment.',
      providers: [{ name: 'aws', type: 'cloud', region: 'us-east-1' }]
    }, 'technical/environment')
    expect(result.valid).toBe(true)
  })

  it('rejects an Environment with an invalid name', () => {
    const result = validator.validate({ name: 'local' }, 'technical/environment')
    expect(result.valid).toBe(false)
  })
})

describe('DnaValidator — operational/signal', () => {
  it('validates a valid Signal', () => {
    const result = validator.validate({
      name: 'lending.Loan.Disbursed',
      operation: 'Loan.Disburse',
      description: 'Published when funds are released.',
      payload: [
        { name: 'loan_id', type: 'string' },
        { name: 'amount', type: 'number' }
      ]
    }, 'operational/signal')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects a Signal missing required payload', () => {
    const result = validator.validate({
      name: 'lending.Loan.Disbursed',
      operation: 'Loan.Disburse'
    }, 'operational/signal')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'payload')).toBe(true)
  })

  it('rejects a Signal with empty payload', () => {
    const result = validator.validate({
      name: 'lending.Loan.Disbursed',
      operation: 'Loan.Disburse',
      payload: []
    }, 'operational/signal')
    expect(result.valid).toBe(false)
  })

  it('rejects a Signal with invalid name pattern', () => {
    const result = validator.validate({
      name: 'LoanDisbursed',
      operation: 'Loan.Disburse',
      payload: [{ name: 'loan_id', type: 'string' }]
    }, 'operational/signal')
    expect(result.valid).toBe(false)
  })
})

describe('DnaValidator — operational/outcome (emits)', () => {
  it('validates an Outcome with emits', () => {
    const result = validator.validate({
      operation: 'Loan.Disburse',
      changes: [{ attribute: 'loan.status', set: 'active' }],
      emits: ['lending.Loan.Disbursed']
    }, 'operational/outcome')
    expect(result.valid).toBe(true)
  })

  it('rejects an Outcome with invalid emits signal pattern', () => {
    const result = validator.validate({
      operation: 'Loan.Disburse',
      changes: [{ attribute: 'loan.status', set: 'active' }],
      emits: ['BadSignalName']
    }, 'operational/outcome')
    expect(result.valid).toBe(false)
  })
})

describe('DnaValidator — operational/relationship', () => {
  it('validates a valid Relationship', () => {
    const result = validator.validate({
      name: 'Loan.borrower',
      from: 'Loan',
      to: 'Borrower',
      cardinality: 'many-to-one',
      attribute: 'borrower_id',
      description: 'Each loan belongs to one borrower.',
      inverse: 'loans'
    }, 'operational/relationship')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects a Relationship missing required fields', () => {
    const result = validator.validate({ name: 'Loan.borrower' }, 'operational/relationship')
    expect(result.valid).toBe(false)
  })

  it('rejects a Relationship with invalid cardinality', () => {
    const result = validator.validate({
      name: 'Loan.borrower',
      from: 'Loan',
      to: 'Borrower',
      cardinality: 'some-to-some',
      attribute: 'borrower_id'
    }, 'operational/relationship')
    expect(result.valid).toBe(false)
  })
})

describe('DnaValidator — composite: operational', () => {
  it('validates the inline operational fixture', () => {
    const result = validator.validate(operationalFixture, 'operational')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects an operational document missing domain', () => {
    const result = validator.validate({ operations: [] }, 'operational')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'domain')).toBe(true)
  })
})

describe('DnaValidator — composite: product/core', () => {
  it('validates a minimal product core document', () => {
    const doc = {
      domain: { name: 'lending', path: 'acme.finance.lending' },
      resources: [
        {
          name: 'Loan',
          attributes: [
            { name: 'amount', type: 'number', required: true },
            { name: 'status', type: 'enum', values: ['pending', 'active'] }
          ],
          actions: [{ name: 'Apply' }, { name: 'Approve' }]
        }
      ],
      operations: [
        { resource: 'Loan', action: 'Apply', name: 'Loan.Apply' },
        { resource: 'Loan', action: 'Approve', name: 'Loan.Approve' }
      ]
    }
    const result = validator.validate(doc, 'product/core')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects a product core document missing domain', () => {
    const result = validator.validate({ resources: [] }, 'product/core')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'domain')).toBe(true)
  })

  it('rejects a product core document missing resources', () => {
    const result = validator.validate({
      domain: { name: 'lending', path: 'acme.finance.lending' }
    }, 'product/core')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'resources')).toBe(true)
  })

  it('rejects unknown top-level properties', () => {
    const result = validator.validate({
      domain: { name: 'lending', path: 'acme.finance.lending' },
      resources: [],
      bogus: true
    }, 'product/core')
    expect(result.valid).toBe(false)
  })
})

describe('DnaValidator — composite: product/api', () => {
  it('validates the inline product/api fixture', () => {
    const result = validator.validate(productApiFixture, 'product/api')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects a product/api document missing endpoints', () => {
    const result = validator.validate({
      namespace: { name: 'Lending', path: '/lending' }
    }, 'product/api')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'endpoints')).toBe(true)
  })
})

describe('DnaValidator — composite: product/ui', () => {
  it('validates the inline product/ui fixture', () => {
    const result = validator.validate(productUiFixture, 'product/ui')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects a product/ui document missing routes', () => {
    const result = validator.validate({
      layout: { name: 'AppLayout', type: 'sidebar' },
      pages: [{ name: 'LoanList', resource: 'Loan' }]
    }, 'product/ui')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'routes')).toBe(true)
  })
})

describe('DnaValidator — composite: technical', () => {
  it('validates the inline technical fixture', () => {
    const result = validator.validate(technicalFixture, 'technical')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects a technical document missing cells', () => {
    const result = validator.validate({ providers: [] }, 'technical')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.params?.missingProperty === 'cells')).toBe(true)
  })
})

describe('DnaValidator — availableSchemas', () => {
  it('lists all registered schemas', () => {
    const schemas = validator.availableSchemas()
    expect(schemas).toContain('operational/resource')
    expect(schemas).toContain('operational/action')
    expect(schemas).toContain('operational/operation')
    expect(schemas).toContain('operational/attribute')
    expect(schemas).toContain('operational/domain')
    expect(schemas).toContain('operational/trigger')
    expect(schemas).toContain('operational/rule')
    expect(schemas).toContain('operational/outcome')
    expect(schemas).toContain('operational/equation')
    expect(schemas).toContain('operational/task')
    expect(schemas).toContain('operational/process')
    expect(schemas).toContain('operational/signal')
    expect(schemas).toContain('operational/relationship')
    expect(schemas).toContain('product/core/resource')
    expect(schemas).toContain('product/core/action')
    expect(schemas).toContain('product/core/operation')
    expect(schemas).toContain('product/core/field')
    expect(schemas).toContain('product/api/endpoint')
    expect(schemas).toContain('product/api/namespace')
    expect(schemas).toContain('product/api/param')
    expect(schemas).toContain('product/api/schema')
    expect(schemas).toContain('product/web/page')
    expect(schemas).toContain('product/web/block')
    expect(schemas).toContain('product/web/layout')
    expect(schemas).toContain('product/web/route')
    expect(schemas).toContain('technical/construct')
    expect(schemas).toContain('technical/provider')
    expect(schemas).toContain('technical/variable')
    expect(schemas).toContain('technical/output')
    expect(schemas).toContain('technical/environment')
    expect(schemas).toContain('technical/cell')
    expect(schemas).toContain('operational')
    expect(schemas).toContain('product/api')
    expect(schemas).toContain('product/ui')
    expect(schemas).toContain('technical')
  })

  it('no longer registers retired primitives (capability, cause, role, user)', () => {
    const schemas = validator.availableSchemas()
    expect(schemas).not.toContain('operational/capability')
    expect(schemas).not.toContain('operational/cause')
    expect(schemas).not.toContain('operational/role')
    expect(schemas).not.toContain('operational/user')
    expect(schemas).not.toContain('product/core/role')
    expect(schemas).not.toContain('operational/position')
    expect(schemas).not.toContain('operational/person')
  })
})

// ── Cross-layer validation ─────────────────────────────────────────────────

describe('DnaValidator — cross-layer validation', () => {
  const operational = operationalFixture
  const productApi = productApiFixture
  const productUi = productUiFixture
  const technical = technicalFixture

  it('passes for valid lending DNA', () => {
    const result = validator.validateCrossLayer({ operational, productApi, productUi, technical })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('detects invalid resource cross-layer reference', () => {
    const badApi = {
      ...productApi,
      resources: [{ name: 'Widget', resource: 'NonExistentResource', fields: [], actions: [] }],
    }
    const result = validator.validateCrossLayer({ operational, productApi: badApi })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('NonExistentResource'))).toBe(true)
    expect(result.errors.some(e => e.layer === 'product/api')).toBe(true)
  })

  it('detects invalid action cross-layer reference', () => {
    const badApi = {
      ...productApi,
      resources: [
        { name: 'Loan', resource: 'Loan', fields: [], actions: [{ name: 'Fly', action: 'Fly' }] },
      ],
    }
    const result = validator.validateCrossLayer({ operational, productApi: badApi })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Action "Fly"'))).toBe(true)
  })

  it('detects API operation not present in operational', () => {
    const badApi = {
      ...productApi,
      operations: [
        { resource: 'Loan', action: 'Warp', name: 'Loan.Warp' },
      ],
    }
    const result = validator.validateCrossLayer({ operational, productApi: badApi })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Loan.Warp'))).toBe(true)
  })

  it('detects invalid endpoint operation reference', () => {
    const badApi = {
      ...productApi,
      endpoints: [{ method: 'GET', path: '/x', operation: 'Loan.Teleport' }],
    }
    const result = validator.validateCrossLayer({ operational, productApi: badApi })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Operation "Loan.Teleport"'))).toBe(true)
  })

  it('detects invalid page resource reference', () => {
    const badUi = {
      ...productUi,
      pages: [{ name: 'WidgetPage', resource: 'Widget', blocks: [] }],
    }
    const result = validator.validateCrossLayer({ operational, productApi, productUi: badUi })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Resource "Widget"'))).toBe(true)
    expect(result.errors.some(e => e.layer === 'product/ui')).toBe(true)
  })

  it('detects invalid block operation reference', () => {
    const badUi = {
      ...productUi,
      pages: [
        {
          name: 'LoanPage',
          resource: 'Loan',
          blocks: [{ name: 'BadBlock', operation: 'Loan.Levitate' }],
        },
      ],
    }
    const result = validator.validateCrossLayer({ operational, productApi, productUi: badUi })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Operation "Loan.Levitate"'))).toBe(true)
  })

  it('detects invalid route page reference', () => {
    const badUi = {
      pages: (productUi as any).pages,
      routes: [{ path: '/nowhere', page: 'GhostPage' }],
    }
    const result = validator.validateCrossLayer({ operational, productApi, productUi: badUi })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Page "GhostPage"'))).toBe(true)
  })

  it('detects invalid construct provider reference', () => {
    const badTech = {
      ...technical,
      constructs: [{ name: 'bad-db', type: 'database', category: 'storage', provider: 'gcp' }],
    }
    const result = validator.validateCrossLayer({ operational, technical: badTech })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Provider "gcp"'))).toBe(true)
    expect(result.errors.some(e => e.layer === 'technical')).toBe(true)
  })

  it('detects invalid cell construct reference', () => {
    const badTech = {
      ...technical,
      cells: [
        { name: 'test-cell', dna: 'lending/product.api', adapter: { type: 'node/express' }, constructs: ['phantom-db'] },
      ],
    }
    const result = validator.validateCrossLayer({ operational, technical: badTech })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Construct "phantom-db"'))).toBe(true)
  })

  it('works with partial layers (only operational + productApi)', () => {
    const result = validator.validateCrossLayer({ operational, productApi })
    expect(result.valid).toBe(true)
  })

  it('works with only technical layer', () => {
    const result = validator.validateCrossLayer({ technical })
    expect(result.valid).toBe(true)
  })

  it('detects invalid Signal operation reference', () => {
    const badOp = {
      ...operational,
      signals: [
        { name: 'lending.Loan.Teleported', operation: 'Loan.Teleport', payload: [{ name: 'id', type: 'string' }] }
      ]
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Operation "Loan.Teleport"'))).toBe(true)
    expect(result.errors.some(e => e.layer === 'operational')).toBe(true)
  })

  it('detects invalid Outcome emits reference', () => {
    const badOp = {
      ...operational,
      outcomes: [
        ...operational.outcomes,
        { operation: 'Loan.Apply', changes: [{ attribute: 'loan.status', set: 'under_review' }], emits: ['lending.Loan.Vanished'] }
      ]
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Signal "lending.Loan.Vanished"'))).toBe(true)
  })

  it('detects invalid Trigger signal reference', () => {
    const badOp = {
      ...operational,
      triggers: [
        ...operational.triggers,
        { operation: 'Loan.Apply', source: 'signal', signal: 'payments.Payment.Ghosted' }
      ]
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Signal "payments.Payment.Ghosted"'))).toBe(true)
  })

  it('detects invalid Trigger process reference', () => {
    const badOp = {
      ...operational,
      triggers: [
        ...operational.triggers,
        { process: 'GhostProcess', source: 'webhook', event: 'x' }
      ]
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Process "GhostProcess"'))).toBe(true)
  })

  it('detects invalid Relationship from resource reference', () => {
    const badOp = {
      ...operational,
      relationships: [
        { name: 'Ghost.borrower', from: 'Ghost', to: 'Borrower', cardinality: 'many-to-one', attribute: 'borrower_id' }
      ]
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Resource "Ghost"') && e.message.includes('(from)'))).toBe(true)
  })

  it('detects invalid Relationship to resource reference', () => {
    const badOp = {
      ...operational,
      relationships: [
        { name: 'Loan.phantom', from: 'Loan', to: 'Phantom', cardinality: 'many-to-one', attribute: 'borrower_id' }
      ]
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Resource "Phantom"') && e.message.includes('(to)'))).toBe(true)
  })

  it('detects invalid Relationship attribute reference', () => {
    const badOp = {
      ...operational,
      relationships: [
        { name: 'Loan.borrower', from: 'Loan', to: 'Borrower', cardinality: 'many-to-one', attribute: 'ghost_id' }
      ]
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Attribute "ghost_id"'))).toBe(true)
  })

  it('detects invalid Task actor reference (Resource missing)', () => {
    const badOp = {
      ...operational,
      tasks: [{ name: 'phantom-task', actor: 'PhantomActor', operation: 'Loan.Apply' }],
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('PhantomActor'))).toBe(true)
  })

  it('detects invalid Resource parent reference', () => {
    const badOp = {
      ...operational,
      domain: {
        ...operational.domain,
        resources: [
          ...operational.domain.resources,
          { name: 'JuniorUnderwriter', parent: 'PhantomRole' },
        ],
      },
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('parent "PhantomRole"'))).toBe(true)
  })

  it('detects Resource.scope referencing a missing Resource', () => {
    const badOp = {
      ...operational,
      domain: {
        ...operational.domain,
        resources: [
          ...operational.domain.resources,
          { name: 'Father', scope: 'PhantomGroup' },
        ],
      },
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('PhantomGroup'))).toBe(true)
  })

  it('detects Membership referencing a missing Role/Group Resource', () => {
    const badOp = {
      ...operational,
      domain: {
        ...operational.domain,
        resources: [
          ...operational.domain.resources,
          { name: 'Joe', memberships: [{ role: 'PhantomRole', in: 'PhantomGroup' }] },
        ],
      },
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('PhantomRole'))).toBe(true)
    expect(result.errors.some(e => e.message.includes('PhantomGroup'))).toBe(true)
  })

  it('detects Membership.in not matching Role.scope', () => {
    const badOp = {
      ...operational,
      domain: {
        ...operational.domain,
        resources: [
          ...operational.domain.resources,
          { name: 'Family' },
          { name: 'RunningClub' },
          { name: 'Father', scope: 'Family' },
          { name: 'Joe', memberships: [{ role: 'Father', in: 'RunningClub' }] },
        ],
      },
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('declares scope "Family"'))).toBe(true)
  })

  it('detects invalid Rule operation reference', () => {
    const badOp = {
      ...operational,
      rules: [
        { operation: 'Loan.Vanish', type: 'access', allow: [{ role: 'Underwriter' }] },
      ],
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Loan.Vanish'))).toBe(true)
  })

  it('detects invalid Rule role reference (Role-Resource missing)', () => {
    const badOp = {
      ...operational,
      rules: [
        { operation: 'Loan.Approve', type: 'access', allow: [{ role: 'PhantomRole' }] },
      ],
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('PhantomRole'))).toBe(true)
  })

  it('detects Process.startStep not referencing a defined Step', () => {
    const badOp = {
      ...operational,
      tasks: [{ name: 'do-thing', actor: 'Underwriter', operation: 'Loan.Approve' }],
      processes: [{
        name: 'BadProc',
        operator: 'LendingManager',
        startStep: 'ghost-step',
        steps: [{ id: 'real-step', task: 'do-thing' }],
      }],
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('startStep "ghost-step"'))).toBe(true)
  })

  it('detects Step.else referencing an unknown sibling', () => {
    const badOp = {
      ...operational,
      tasks: [{ name: 'do-thing', actor: 'Underwriter', operation: 'Loan.Approve' }],
      processes: [{
        name: 'BadProc',
        operator: 'LendingManager',
        startStep: 'real-step',
        steps: [{ id: 'real-step', task: 'do-thing', else: 'phantom-step' }],
      }],
    }
    const result = validator.validateCrossLayer({ operational: badOp })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('phantom-step'))).toBe(true)
  })
})

// ── Cross-layer: product.core ────────────────────────────────────────────────

describe('DnaValidator — cross-layer with product.core', () => {
  const operational = operationalFixture
  const productApi = productApiFixture
  const productCore = productCoreFixture

  it('passes when core is consistent with operational', () => {
    const result = validator.validateCrossLayer({ operational, productCore })
    expect(result.valid).toBe(true)
  })

  it('detects a Resource in product.core that is not in operational', () => {
    const badCore = {
      ...productCore,
      resources: [...(productCore.resources ?? []), { name: 'Phantom', attributes: [], actions: [] }],
    }
    const result = validator.validateCrossLayer({ operational, productCore: badCore })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.layer === 'product/core' && e.message.includes('Phantom'))).toBe(true)
  })

  it('detects an Operation in product.core that is not in operational', () => {
    const badCore = {
      ...productCore,
      operations: [
        ...(productCore.operations ?? []),
        { resource: 'Loan', action: 'Vanish', name: 'Loan.Vanish' },
      ],
    }
    const result = validator.validateCrossLayer({ operational, productCore: badCore })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Loan.Vanish'))).toBe(true)
  })

  it('resolves product.api resource refs against product.core when present', () => {
    const result = validator.validateCrossLayer({ productCore, productApi })
    expect(result.valid).toBe(true)
  })

  it('detects product.api references against product.core (not operational)', () => {
    const minimalCore = {
      domain: { name: 'lending', path: 'acme.finance.lending' },
      resources: [{ name: 'Loan', actions: [{ name: 'Apply' }] }],
    }
    const badApi = {
      ...productApi,
      resources: [{ name: 'Borrower', resource: 'Borrower', fields: [], actions: [] }],
    }
    const result = validator.validateCrossLayer({ productCore: minimalCore, productApi: badApi })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Borrower') && e.message.includes('Product Core'))).toBe(true)
  })

  it('falls back to operational when product.core is absent', () => {
    const result = validator.validateCrossLayer({ operational, productApi, productUi: productUiFixture })
    expect(result.valid).toBe(true)
  })
})
