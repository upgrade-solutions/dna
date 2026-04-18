/**
 * @dna-codes/input-example — template input adapter.
 *
 * This package demonstrates the two input modes with matching entry points:
 *
 *   parse(data, options)                  — deterministic (sync, pure)
 *   parseText(text, options)              — probabilistic (async, LLM-backed)
 *
 * When forking, KEEP ONE mode and delete the other along with its files
 * (`providers.ts` + `prompt.ts` for the probabilistic side). Both are kept
 * here so agents can see either pattern without hunting across packages.
 *
 * Contract (shared across input-*):
 *   - Throw on structural errors the caller should fix; let the
 *     `@dna-codes/core` validator handle downstream DNA validation.
 *   - Return an object keyed by DNA layer (operational, productCore, ...).
 *     Never return a bare array or scalar.
 *   - Zero runtime dependencies. Use global `fetch` for probabilistic mode.
 */
import { EntityListInput, ParseOptions, ParseResult, TextParseOptions, TextParseResult } from './types';
export declare function parse(data: EntityListInput, options: ParseOptions): ParseResult;
export declare function parseText(text: string, options: TextParseOptions): Promise<TextParseResult>;
export * from './types';
//# sourceMappingURL=index.d.ts.map