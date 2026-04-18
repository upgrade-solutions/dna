import { parse } from './index'
import { OpenApiSpec } from './types'

const pets: OpenApiSpec = {
  openapi: '3.0.3',
  info: { title: 'Pet Store', description: 'Manage pets and orders.', version: '1.0.0' },
  servers: [{ url: 'https://api.example.com/v1' }],
  paths: {
    '/pets': {
      get: {
        operationId: 'listPets',
        tags: ['Pet'],
        summary: 'List all pets.',
        parameters: [
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer' } },
        ],
      },
      post: {
        operationId: 'createPet',
        summary: 'Create a new pet.',
      },
    },
    '/pets/{id}': {
      get: {
        operationId: 'getPet',
        summary: 'Retrieve a pet by id.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
      },
    },
  },
  components: {
    schemas: {
      Pet: {
        type: 'object',
        description: 'A pet for sale.',
        required: ['id', 'name'],
        properties: {
          id: { type: 'string', description: 'Unique identifier' },
          name: { type: 'string' },
          tag: { type: 'string' },
          age: { type: 'integer' },
        },
      },
    },
  },
}

describe('@dna-codes/input-openapi', () => {
  describe('namespace', () => {
    it('derives name from info.title in PascalCase', () => {
      const { productApi } = parse(pets)
      expect(productApi.namespace.name).toBe('PetStore')
    })

    it('uses the path portion of servers[0].url', () => {
      const { productApi } = parse(pets)
      expect(productApi.namespace.path).toBe('/v1')
    })

    it('falls back to "/" when no servers are declared', () => {
      const { productApi } = parse({ ...pets, servers: undefined })
      expect(productApi.namespace.path).toBe('/')
    })

    it('honors explicit namespaceName and namespacePath overrides', () => {
      const { productApi } = parse(pets, { namespaceName: 'Pets', namespacePath: '/petstore' })
      expect(productApi.namespace.name).toBe('Pets')
      expect(productApi.namespace.path).toBe('/petstore')
    })

    it('preserves info.description as namespace.description', () => {
      const { productApi } = parse(pets)
      expect(productApi.namespace.description).toBe('Manage pets and orders.')
    })
  })

  describe('endpoints', () => {
    it('emits one endpoint per (path, method) pair', () => {
      const { productApi } = parse(pets)
      expect(productApi.endpoints).toHaveLength(3)
    })

    it('uppercases the HTTP method', () => {
      const { productApi } = parse(pets)
      const methods = productApi.endpoints.map((e) => e.method).sort()
      expect(methods).toEqual(['GET', 'GET', 'POST'])
    })

    it('derives operation from operationId (camelCase → Resource.Action)', () => {
      const { productApi } = parse(pets)
      const byPathMethod = productApi.endpoints.find((e) => e.method === 'GET' && e.path === '/pets')
      expect(byPathMethod?.operation).toBe('Pets.List')
    })

    it('extracts path + query params with types mapped to DNA types', () => {
      const { productApi } = parse(pets)
      const list = productApi.endpoints.find((e) => e.method === 'GET' && e.path === '/pets')
      expect(list?.params).toEqual([
        { name: 'limit', in: 'query', type: 'number', required: false },
      ])

      const byId = productApi.endpoints.find((e) => e.path === '/pets/{id}')
      expect(byId?.params).toEqual([
        { name: 'id', in: 'path', type: 'string', required: true },
      ])
    })

    it('skips non-HTTP-method keys on a path (extensions, parameters)', () => {
      const withExtension: OpenApiSpec = {
        ...pets,
        paths: {
          '/pets': {
            get: { operationId: 'listPets' },
            'x-internal': { ignored: true } as unknown as never,
          },
        },
      }
      const { productApi } = parse(withExtension)
      expect(productApi.endpoints).toHaveLength(1)
    })
  })

  describe('schemas', () => {
    it('emits one ParsedSchema per components.schemas entry', () => {
      const { productApi } = parse(pets)
      expect(productApi.schemas).toHaveLength(1)
      expect(productApi.schemas![0].name).toBe('Pet')
    })

    it('marks required properties', () => {
      const { productApi } = parse(pets)
      const pet = productApi.schemas![0]
      const byName = Object.fromEntries(pet.fields.map((f) => [f.name, f]))
      expect(byName.id.required).toBe(true)
      expect(byName.name.required).toBe(true)
      expect(byName.tag.required).toBeUndefined()
    })

    it('maps JSON Schema types to DNA types (integer → number)', () => {
      const { productApi } = parse(pets)
      const byName = Object.fromEntries(productApi.schemas![0].fields.map((f) => [f.name, f]))
      expect(byName.id.type).toBe('string')
      expect(byName.age.type).toBe('number')
    })

    it('omits schemas key when there are no components.schemas', () => {
      const { productApi } = parse({ ...pets, components: undefined })
      expect(productApi.schemas).toBeUndefined()
    })
  })

  /**
   * Drift detection: validate parse() output against the canonical product.api
   * JSON Schema from @dna-codes/schemas (loaded via @dna-codes/core). If the
   * schema changes shape, this test fails until the adapter catches up.
   */
  describe('schema conformance', () => {
    it('emits product.api DNA that validates against @dna-codes/schemas', () => {
      const { DnaValidator } = require('@dna-codes/core') as typeof import('@dna-codes/core')
      const { productApi } = parse(pets)
      const result = new DnaValidator().validate(productApi, 'https://dna.local/product/api')
      if (!result.valid) {
        throw new Error(
          `input-openapi output failed product.api schema validation:\n${JSON.stringify(result.errors, null, 2)}`,
        )
      }
    })
  })
})
