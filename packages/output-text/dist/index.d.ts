/**
 * @dna-codes/dna-output-text — render DNA as plain prose.
 *
 *   render(dna, options?)     → string                      // one combined document
 *   renderMany(dna, options?) → Array<{id, title, body}>    // one document per unit
 *
 * Both accept a `styles` map: `{ operation: 'user-story' | 'gherkin' | 'product-dna', ... }`.
 * The key set determines which unit types are emitted; the value picks the
 * body template. Default is `{ operation: 'user-story' }`.
 *
 * `user-story` and `gherkin` are action-shaped and only fit Operation —
 * Resource and Process always render as `product-dna` regardless of the style
 * requested.
 */
import { DnaInput, RenderManyOptions, RenderOptions, TextDocument } from './types';
export declare function render(dna: DnaInput, options?: RenderOptions): string;
export declare function renderMany(dna: DnaInput, options?: RenderManyOptions): TextDocument[];
export { Style, StyleMap, Unit, TextDocument, RenderOptions, RenderManyOptions } from './types';
export { DEFAULT_STYLES } from './types';
export type { DnaInput } from './types';
//# sourceMappingURL=index.d.ts.map