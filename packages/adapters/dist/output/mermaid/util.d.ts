import { Resource, OperationalDomain } from './types';
export declare function collectResources(domain: OperationalDomain): Resource[];
/** Sanitize a DNA name for use as a mermaid identifier (no quotes / spaces). */
export declare function mermaidId(s: string): string;
/** Escape a string for use inside a mermaid node label (quotes become &quot;). */
export declare function labelEscape(s: string): string;
//# sourceMappingURL=util.d.ts.map