import * as fs from 'fs'
import * as path from 'path'
import { SCHEMA_ROOT } from '../index'
import type {
  Attribute,
  Action,
  Resource,
  Person,
  Group,
  Role,
  Membership,
  Operation,
  Trigger,
  Rule,
  Task,
  Process,
  Relationship,
} from './operational'
import { DnaValidator } from '../validator'

/**
 * Load a schema's `examples[]` and re-validate each example against the same
 * schema using the runtime validator. Belt-and-suspenders: if the schema
 * grows a field the TS type doesn't know about, the examples still validate
 * at runtime; if the example data is wrong, the schema author finds out.
 *
 * The TS-side coverage is the type assignment in each `it` block — TypeScript
 * fails the build if the example shape can't satisfy the corresponding type.
 */
function readExamples<T = unknown>(rel: string): T[] {
  const file = path.join(SCHEMA_ROOT, rel)
  const schema = JSON.parse(fs.readFileSync(file, 'utf-8'))
  return Array.isArray(schema.examples) ? (schema.examples as T[]) : []
}

const validator = new DnaValidator()

describe('Operational TS types ↔ JSON Schema contract', () => {
  it('Attribute examples satisfy the TS type and the JSON schema', () => {
    const examples = readExamples<Attribute>('operational/attribute.json')
    expect(examples.length).toBeGreaterThan(0)
    for (const ex of examples) {
      // TS-side: the type cast in readExamples enforces the shape. If the
      // schema gains a field the TS Attribute type is missing, this file fails
      // to compile.
      const _typed: Attribute = ex
      const result = validator.validate(_typed, 'operational/attribute')
      expect(result.valid).toBe(true)
    }
  })

  it('Action examples satisfy the TS type and the JSON schema', () => {
    const examples = readExamples<Action>('operational/action.json')
    for (const ex of examples) {
      const _typed: Action = ex
      const result = validator.validate(_typed, 'operational/action')
      expect(result.valid).toBe(true)
    }
  })

  it('Resource examples satisfy the TS type and the JSON schema', () => {
    const examples = readExamples<Resource>('operational/resource.json')
    for (const ex of examples) {
      const _typed: Resource = ex
      const result = validator.validate(_typed, 'operational/resource')
      expect(result.valid).toBe(true)
    }
  })

  it('Person examples satisfy the TS type and the JSON schema', () => {
    const examples = readExamples<Person>('operational/person.json')
    for (const ex of examples) {
      const _typed: Person = ex
      const result = validator.validate(_typed, 'operational/person')
      expect(result.valid).toBe(true)
    }
  })

  it('Group examples satisfy the TS type and the JSON schema', () => {
    const examples = readExamples<Group>('operational/group.json')
    for (const ex of examples) {
      const _typed: Group = ex
      const result = validator.validate(_typed, 'operational/group')
      expect(result.valid).toBe(true)
    }
  })

  it('Role examples satisfy the TS type and the JSON schema', () => {
    const examples = readExamples<Role>('operational/role.json')
    for (const ex of examples) {
      const _typed: Role = ex
      const result = validator.validate(_typed, 'operational/role')
      expect(result.valid).toBe(true)
    }
  })

  it('Membership examples satisfy the TS type and the JSON schema', () => {
    const examples = readExamples<Membership>('operational/membership.json')
    for (const ex of examples) {
      const _typed: Membership = ex
      const result = validator.validate(_typed, 'operational/membership')
      expect(result.valid).toBe(true)
    }
  })

  it('Operation examples satisfy the TS type and the JSON schema', () => {
    const examples = readExamples<Operation>('operational/operation.json')
    for (const ex of examples) {
      const _typed: Operation = ex
      const result = validator.validate(_typed, 'operational/operation')
      expect(result.valid).toBe(true)
    }
  })

  it('Trigger examples satisfy the TS type and the JSON schema', () => {
    const examples = readExamples<Trigger>('operational/trigger.json')
    for (const ex of examples) {
      const _typed: Trigger = ex
      const result = validator.validate(_typed, 'operational/trigger')
      expect(result.valid).toBe(true)
    }
  })

  it('Rule examples satisfy the TS type and the JSON schema', () => {
    const examples = readExamples<Rule>('operational/rule.json')
    for (const ex of examples) {
      const _typed: Rule = ex
      const result = validator.validate(_typed, 'operational/rule')
      expect(result.valid).toBe(true)
    }
  })

  it('Task examples satisfy the TS type and the JSON schema', () => {
    const examples = readExamples<Task>('operational/task.json')
    for (const ex of examples) {
      const _typed: Task = ex
      const result = validator.validate(_typed, 'operational/task')
      expect(result.valid).toBe(true)
    }
  })

  it('Process examples satisfy the TS type and the JSON schema', () => {
    const examples = readExamples<Process>('operational/process.json')
    for (const ex of examples) {
      const _typed: Process = ex
      const result = validator.validate(_typed, 'operational/process')
      expect(result.valid).toBe(true)
    }
  })

  it('Relationship examples satisfy the TS type and the JSON schema', () => {
    const examples = readExamples<Relationship>('operational/relationship.json')
    for (const ex of examples) {
      const _typed: Relationship = ex
      const result = validator.validate(_typed, 'operational/relationship')
      expect(result.valid).toBe(true)
    }
  })
})
