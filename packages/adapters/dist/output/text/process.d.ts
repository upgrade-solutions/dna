/**
 * Render a single Process. Processes render in `product-dna` vocabulary
 * (Operation / Role / Steps) — the action-shaped styles don't fit a DAG.
 */
import { OperationalDna, Process } from './types';
export declare function processTitle(p: Process): string;
export declare function renderProcess(p: Process, op: OperationalDna): string;
//# sourceMappingURL=process.d.ts.map