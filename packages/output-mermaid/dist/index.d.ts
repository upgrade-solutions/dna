import { DnaInput } from './types';
import { FlowchartDirection } from './diagrams/flowchart';
export type Diagram = 'erd' | 'flowchart';
export declare const DEFAULT_DIAGRAMS: readonly Diagram[];
export interface RenderOptions {
    /** Which diagrams to emit, in the given order. Defaults to DEFAULT_DIAGRAMS. */
    diagrams?: readonly Diagram[];
    /** Direction for flowchart diagrams. Defaults to 'TD'. */
    flowchartDirection?: FlowchartDirection;
}
/**
 * Returns raw Mermaid source. Multiple diagrams are concatenated with blank
 * lines between blocks; no code-fence wrapping (callers can add ``` markers
 * if embedding in markdown).
 */
export declare function render(dna: DnaInput, options?: RenderOptions): string;
export type { FlowchartDirection } from './diagrams/flowchart';
export * from './types';
//# sourceMappingURL=index.d.ts.map