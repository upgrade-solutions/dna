import SwaggerParser from '@apidevtools/swagger-parser'
import { bookshopInput } from '@dna-codes/dna-core'
import * as YAML from 'js-yaml'
import { render, type ProductApi } from './index'

const bookshopProductApi = bookshopInput.productApi as unknown as ProductApi

describe('@dna-codes/dna-output-openapi', () => {
  describe('render() — bookshop fixture', () => {
    it('round-trips: YAML output parses back to a structurally equivalent doc', () => {
      const { content, format } = render(bookshopProductApi)
      expect(format).toBe('yaml')
      const parsed = YAML.load(content) as Record<string, unknown>
      expect(parsed.openapi).toBe('3.1.0')
      expect((parsed.info as Record<string, unknown>).title).toBe('Bookshop API')
      expect((parsed.paths as Record<string, unknown>)['/bookshop/books']).toBeDefined()
      expect((parsed.paths as Record<string, unknown>)['/bookshop/books/{id}']).toBeDefined()
      expect((parsed.paths as Record<string, unknown>)['/bookshop/books/{id}/publish']).toBeDefined()
    })

    it('passes OpenAPI 3.1 schema validation', async () => {
      const { content } = render(bookshopProductApi)
      const parsed = YAML.load(content) as object
      // SwaggerParser.validate fully validates against the OpenAPI 3.x schema
      // including resolving every $ref. Throws if invalid.
      await expect(SwaggerParser.validate(JSON.parse(JSON.stringify(parsed)))).resolves.toBeDefined()
    })

    it('emits stable output for the bookshop fixture (snapshot)', () => {
      const { content } = render(bookshopProductApi)
      expect(content).toMatchSnapshot()
    })

    it('format: "json" produces equivalent structure to YAML', () => {
      const yaml = render(bookshopProductApi, { format: 'yaml' })
      const json = render(bookshopProductApi, { format: 'json' })
      expect(json.format).toBe('json')
      const fromYaml = YAML.load(yaml.content)
      const fromJson = JSON.parse(json.content)
      expect(fromJson).toEqual(fromYaml)
    })
  })

  describe('render() — mapping rules', () => {
    it('converts :param style paths to {param} style', () => {
      const { content } = render(bookshopProductApi)
      expect(content).not.toContain(':id')
      expect(content).toContain('/bookshop/books/{id}')
    })

    it('hoists named request/response Schemas into components.schemas', () => {
      const { content } = render(bookshopProductApi)
      const doc = YAML.load(content) as { components: { schemas: Record<string, unknown> } }
      expect(doc.components.schemas).toHaveProperty('BookListResponse')
      expect(doc.components.schemas).toHaveProperty('BookResponse')
      expect(doc.components.schemas).toHaveProperty('PublishBookRequest')
    })

    it('emits operationId from Resource.Action as camelCase', () => {
      const { content } = render(bookshopProductApi)
      const doc = YAML.load(content) as {
        paths: Record<string, Record<string, { operationId?: string }>>
      }
      expect(doc.paths['/bookshop/books'].get.operationId).toBe('bookList')
      expect(doc.paths['/bookshop/books/{id}'].get.operationId).toBe('bookGet')
      expect(doc.paths['/bookshop/books/{id}/publish'].post.operationId).toBe('bookPublish')
    })

    it('preserves endpoint description verbatim, including SSE-behavior prose (v0.1 convention)', () => {
      const sseFixture: ProductApi = {
        namespace: { name: 'Streaming', path: '/streaming' },
        endpoints: [
          {
            method: 'POST',
            path: '/v1/text',
            operation: 'Text.Parse',
            description:
              'Parse freeform text into DNA. With Accept: text/event-stream, the response streams ' +
              'tool_call events followed by a final result event. Otherwise, returns the buffered final result.',
            request: {
              name: 'ParseTextRequest',
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            response: {
              name: 'ParseTextResponse',
              fields: [{ name: 'operational', type: 'reference' }],
            },
          },
        ],
      }
      const { content } = render(sseFixture)
      const doc = YAML.load(content) as {
        paths: Record<string, Record<string, { description: string; responses: Record<string, { content: Record<string, unknown> }> }>>
      }
      const op = doc.paths['/v1/text'].post
      expect(op.description).toContain('text/event-stream')
      expect(op.description).toContain('tool_call events')
      expect(op.responses['200'].content).toHaveProperty('application/json')
      expect(op.responses['200'].content).not.toHaveProperty('text/event-stream')
    })

    it('emits parameters with correct in/required/schema', () => {
      const { content } = render(bookshopProductApi)
      const doc = YAML.load(content) as {
        paths: Record<string, Record<string, { parameters: { name: string; in: string; required?: boolean }[] }>>
      }
      const listParams = doc.paths['/bookshop/books'].get.parameters
      expect(listParams.find((p) => p.name === 'status')?.in).toBe('query')
      expect(listParams.find((p) => p.name === 'limit')?.in).toBe('query')
      const getParams = doc.paths['/bookshop/books/{id}'].get.parameters
      expect(getParams.find((p) => p.name === 'id')?.required).toBe(true)
    })

    it('uses tags from namespace name', () => {
      const { content } = render(bookshopProductApi)
      const doc = YAML.load(content) as {
        tags?: { name: string }[]
        paths: Record<string, Record<string, { tags?: string[] }>>
      }
      expect(doc.tags?.[0].name).toBe('Bookshop')
      expect(doc.paths['/bookshop/books'].get.tags).toEqual(['Bookshop'])
    })

    it('honors title and version overrides', () => {
      const { content } = render(bookshopProductApi, { title: 'Custom', version: '1.2.3' })
      const doc = YAML.load(content) as { info: { title: string; version: string } }
      expect(doc.info.title).toBe('Custom')
      expect(doc.info.version).toBe('1.2.3')
    })
  })

  describe('render() — nested object Fields', () => {
    const conversionFixture: ProductApi = {
      namespace: { name: 'Convert', path: '/convert' },
      endpoints: [
        {
          method: 'POST',
          path: '/v1/convert',
          operation: 'Conversion.Create',
          request: {
            name: 'ConvertRequest',
            fields: [
              {
                name: 'from',
                label: 'From',
                type: 'object',
                required: true,
                fields: [
                  { name: 'format', type: 'enum', values: ['text', 'json', 'dna'], required: true },
                  { name: 'input', type: 'string', required: true },
                ],
              },
              {
                name: 'to',
                label: 'To',
                type: 'object',
                required: true,
                fields: [
                  { name: 'format', type: 'enum', values: ['text', 'json', 'dna'], required: true },
                ],
              },
            ],
          },
          response: {
            name: 'ConvertResponse',
            fields: [{ name: 'output', type: 'string' }],
          },
        },
      ],
    }

    it('renders an object Field as an OpenAPI object schema with nested properties', () => {
      const { content } = render(conversionFixture)
      const doc = YAML.load(content) as {
        components: { schemas: Record<string, { properties: Record<string, { type: string; properties?: Record<string, unknown>; required?: string[] }> }> }
      }
      const req = doc.components.schemas.ConvertRequest
      expect(req.properties.from.type).toBe('object')
      expect(req.properties.from.properties).toBeDefined()
      expect(Object.keys(req.properties.from.properties!)).toEqual(['format', 'input'])
      expect(req.properties.from.required).toEqual(['format', 'input'])
    })

    it('passes OpenAPI 3.1 schema validation with nested objects', async () => {
      const { content } = render(conversionFixture)
      const parsed = YAML.load(content) as object
      await expect(SwaggerParser.validate(JSON.parse(JSON.stringify(parsed)))).resolves.toBeDefined()
    })

    it('emits stable output for the nested-object fixture (snapshot)', () => {
      const { content } = render(conversionFixture)
      expect(content).toMatchSnapshot()
    })
  })

  describe('render() — JSON output', () => {
    it('returns parseable JSON when format is "json"', () => {
      const { content, format } = render(bookshopProductApi, { format: 'json' })
      expect(format).toBe('json')
      expect(() => JSON.parse(content)).not.toThrow()
    })

    it('JSON output is also valid against OpenAPI 3.1', async () => {
      const { content } = render(bookshopProductApi, { format: 'json' })
      await expect(SwaggerParser.validate(JSON.parse(content))).resolves.toBeDefined()
    })
  })
})
