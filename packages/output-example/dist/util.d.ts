import { Noun, OperationalDomain } from './types';
/** Flatten a domain tree into a single list of Nouns. */
export declare function collectNouns(domain: OperationalDomain): Noun[];
/** Repeat a character n times, clamped to [min, max]. */
export declare function repeat(ch: string, n: number, min?: number, max?: number): string;
/** Indent every line of a string by `spaces` spaces. */
export declare function indent(s: string, spaces: number): string;
//# sourceMappingURL=util.d.ts.map