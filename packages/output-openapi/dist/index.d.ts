import { OpenApiOutput, ProductApi, RenderOptions } from './types';
/**
 * Render a DNA Product API document to an OpenAPI 3.1 specification.
 *
 * v0.1 scope: every request and response is `application/json`. The current
 * `@dna-codes/schemas` Endpoint shape carries no `content_type` field and a
 * single `response` (not a status-code map), so SSE and multi-status responses
 * are not faithfully rendered. SSE behavior should be documented in the
 * endpoint's `description` (prose). See `redesign-endpoint-responses` for the
 * follow-on schema work.
 */
export declare function render(productApi: ProductApi, options?: RenderOptions): OpenApiOutput;
export * from './types';
//# sourceMappingURL=index.d.ts.map