"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_parser_1 = __importDefault(require("@apidevtools/swagger-parser"));
const core_1 = require("@dna-codes/core");
const YAML = __importStar(require("js-yaml"));
const index_1 = require("./index");
const bookshopProductApi = core_1.bookshopInput.productApi;
describe('@dna-codes/output-openapi', () => {
    describe('render() — bookshop fixture', () => {
        it('round-trips: YAML output parses back to a structurally equivalent doc', () => {
            const { content, format } = (0, index_1.render)(bookshopProductApi);
            expect(format).toBe('yaml');
            const parsed = YAML.load(content);
            expect(parsed.openapi).toBe('3.1.0');
            expect(parsed.info.title).toBe('Bookshop API');
            expect(parsed.paths['/bookshop/books']).toBeDefined();
            expect(parsed.paths['/bookshop/books/{id}']).toBeDefined();
            expect(parsed.paths['/bookshop/books/{id}/publish']).toBeDefined();
        });
        it('passes OpenAPI 3.1 schema validation', async () => {
            const { content } = (0, index_1.render)(bookshopProductApi);
            const parsed = YAML.load(content);
            // SwaggerParser.validate fully validates against the OpenAPI 3.x schema
            // including resolving every $ref. Throws if invalid.
            await expect(swagger_parser_1.default.validate(JSON.parse(JSON.stringify(parsed)))).resolves.toBeDefined();
        });
        it('emits stable output for the bookshop fixture (snapshot)', () => {
            const { content } = (0, index_1.render)(bookshopProductApi);
            expect(content).toMatchSnapshot();
        });
        it('format: "json" produces equivalent structure to YAML', () => {
            const yaml = (0, index_1.render)(bookshopProductApi, { format: 'yaml' });
            const json = (0, index_1.render)(bookshopProductApi, { format: 'json' });
            expect(json.format).toBe('json');
            const fromYaml = YAML.load(yaml.content);
            const fromJson = JSON.parse(json.content);
            expect(fromJson).toEqual(fromYaml);
        });
    });
    describe('render() — mapping rules', () => {
        it('converts :param style paths to {param} style', () => {
            const { content } = (0, index_1.render)(bookshopProductApi);
            expect(content).not.toContain(':id');
            expect(content).toContain('/bookshop/books/{id}');
        });
        it('hoists named request/response Schemas into components.schemas', () => {
            const { content } = (0, index_1.render)(bookshopProductApi);
            const doc = YAML.load(content);
            expect(doc.components.schemas).toHaveProperty('BookListResponse');
            expect(doc.components.schemas).toHaveProperty('BookResponse');
            expect(doc.components.schemas).toHaveProperty('PublishBookRequest');
        });
        it('emits operationId from Resource.Action as camelCase', () => {
            const { content } = (0, index_1.render)(bookshopProductApi);
            const doc = YAML.load(content);
            expect(doc.paths['/bookshop/books'].get.operationId).toBe('bookList');
            expect(doc.paths['/bookshop/books/{id}'].get.operationId).toBe('bookGet');
            expect(doc.paths['/bookshop/books/{id}/publish'].post.operationId).toBe('bookPublish');
        });
        it('preserves endpoint description verbatim, including SSE-behavior prose (v0.1 convention)', () => {
            const sseFixture = {
                namespace: { name: 'Streaming', path: '/streaming' },
                endpoints: [
                    {
                        method: 'POST',
                        path: '/v1/text',
                        operation: 'Text.Parse',
                        description: 'Parse freeform text into DNA. With Accept: text/event-stream, the response streams ' +
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
            };
            const { content } = (0, index_1.render)(sseFixture);
            const doc = YAML.load(content);
            const op = doc.paths['/v1/text'].post;
            expect(op.description).toContain('text/event-stream');
            expect(op.description).toContain('tool_call events');
            expect(op.responses['200'].content).toHaveProperty('application/json');
            expect(op.responses['200'].content).not.toHaveProperty('text/event-stream');
        });
        it('emits parameters with correct in/required/schema', () => {
            const { content } = (0, index_1.render)(bookshopProductApi);
            const doc = YAML.load(content);
            const listParams = doc.paths['/bookshop/books'].get.parameters;
            expect(listParams.find((p) => p.name === 'status')?.in).toBe('query');
            expect(listParams.find((p) => p.name === 'limit')?.in).toBe('query');
            const getParams = doc.paths['/bookshop/books/{id}'].get.parameters;
            expect(getParams.find((p) => p.name === 'id')?.required).toBe(true);
        });
        it('uses tags from namespace name', () => {
            const { content } = (0, index_1.render)(bookshopProductApi);
            const doc = YAML.load(content);
            expect(doc.tags?.[0].name).toBe('Bookshop');
            expect(doc.paths['/bookshop/books'].get.tags).toEqual(['Bookshop']);
        });
        it('honors title and version overrides', () => {
            const { content } = (0, index_1.render)(bookshopProductApi, { title: 'Custom', version: '1.2.3' });
            const doc = YAML.load(content);
            expect(doc.info.title).toBe('Custom');
            expect(doc.info.version).toBe('1.2.3');
        });
    });
    describe('render() — JSON output', () => {
        it('returns parseable JSON when format is "json"', () => {
            const { content, format } = (0, index_1.render)(bookshopProductApi, { format: 'json' });
            expect(format).toBe('json');
            expect(() => JSON.parse(content)).not.toThrow();
        });
        it('JSON output is also valid against OpenAPI 3.1', async () => {
            const { content } = (0, index_1.render)(bookshopProductApi, { format: 'json' });
            await expect(swagger_parser_1.default.validate(JSON.parse(content))).resolves.toBeDefined();
        });
    });
});
//# sourceMappingURL=index.test.js.map