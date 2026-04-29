/**
 * @dna-codes/dna-output-example — template output renderer.
 *
 * Public contract (shared across output-*):
 *
 *   render(dna: DnaInput, options?: RenderOptions): string
 *
 * - Sync, pure, zero I/O.
 * - Never throws on malformed / partial DNA — returns `''` when there's
 *   nothing to render.
 * - Never returns null. If a section produces nothing, it's dropped.
 * - Zero runtime dependencies. `@dna-codes/dna-core` is a dev dep (for types)
 *   at most; don't import it at runtime.
 *
 * The demo renders DNA as plain-text markdown-lite. Fork the sections
 * and rewrite for your target format (HTML, Mermaid, PDF bytes, etc.).
 */
import { DnaInput } from './types';
export type Section = 'summary' | 'domain-model';
export declare const DEFAULT_SECTIONS: readonly Section[];
export interface RenderOptions {
    /** Which sections to emit, in the given order. */
    sections?: readonly Section[];
    /** Document title. Defaults to the operational domain's `path` or `name`. */
    title?: string;
    /** Starting heading level. Defaults to 1. */
    headingLevel?: 1 | 2;
}
export declare function render(dna: DnaInput, options?: RenderOptions): string;
export * from './types';
//# sourceMappingURL=index.d.ts.map