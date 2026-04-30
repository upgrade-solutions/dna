import type { MergeChunk, MergeResult, OperationalDNA } from '../types/merge';
/**
 * Merge multiple Operational DNA chunks into a single document.
 *
 * Pure: no I/O, no LLM calls, no global state. Deterministic for a given
 * input ordering. Identity-by-name is global — two `Loan` Resources from
 * different chunks (and different nested domains) become a single merged
 * Resource at the top of the resulting DNA's domain.
 *
 * Note: v1 flattens the input domain hierarchy. All noun primitives across
 * input chunks land directly on the merged top-level domain. Sub-domain
 * structure is not preserved — see `docs/operational.md` for rationale.
 */
export declare function merge(input: OperationalDNA[] | MergeChunk[]): MergeResult;
//# sourceMappingURL=index.d.ts.map