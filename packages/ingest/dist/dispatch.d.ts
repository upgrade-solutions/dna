import type { Integration, InputAdapter } from './types';
/**
 * Extract the URI scheme (`gdrive`, `notion`, `file`, ...) from a source
 * string. Returns `null` for bare paths.
 */
export declare function schemeOf(uri: string): string | null;
/**
 * Look up an Integration for a source URI. `file://` URIs and bare
 * filesystem paths return the built-in fs fetcher. Other schemes route to
 * `integrations[<scheme>]`. Unknown scheme → `null` (caller surfaces a
 * non-fatal error).
 */
export declare function integrationFor(uri: string, integrations: Record<string, Integration>, builtIn?: Integration): Integration | null;
/**
 * Look up an InputAdapter for a MIME type. Glob match against the keys of
 * the `inputs` map: `*` is a wildcard within a MIME segment (`text/*`
 * matches `text/markdown`). More specific keys are preferred over
 * wildcards.
 *
 * Specificity score = number of non-`*` segments. With two MIME segments
 * (`type/subtype`), an exact match scores 2, `text/*` scores 1, `*\/*`
 * scores 0.
 */
export declare function adapterFor(mimeType: string, inputs: Record<string, InputAdapter>): {
    key: string;
    adapter: InputAdapter;
} | null;
//# sourceMappingURL=dispatch.d.ts.map