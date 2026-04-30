import type { OperationalDNA } from '../types/merge';
import type { Process } from '../types/operational';
import { type BuilderOptions, type BuilderResult } from './shared';
/**
 * Add a Process to the DNA's top-level `processes`. Same-name composes via
 * merge rules; `steps[]` union by `id`.
 */
export declare function addProcess(dna: OperationalDNA, process: Process, opts?: BuilderOptions): BuilderResult;
//# sourceMappingURL=process.d.ts.map