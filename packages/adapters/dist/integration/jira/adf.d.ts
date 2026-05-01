/**
 * Atlassian Document Format helpers.
 *
 * Jira Cloud REST v3 returns description fields as ADF (a JSON tree) rather
 * than markdown. We only need two operations:
 *
 *   extractText(adf) — flatten to plain prose for feeding into input-text
 *   fromMarkdown(md) — wrap markdown-flavored text as a minimal ADF doc so
 *                     create-issue payloads are accepted
 *
 * fromMarkdown is intentionally dumb: one ADF `paragraph` per input line.
 * Jira renders inline markdown like **bold** and `code` inside a paragraph's
 * text node well enough for the Story bodies this package emits. If you need
 * richer rendering, swap this out for a full ADF builder.
 */
import { AdfNode } from './types';
export declare function extractText(description: unknown): string;
/**
 * Minimal markdown → ADF converter covering what @dna-codes/dna-output-text emits:
 *   - paragraphs separated by blank lines
 *   - bullet lists (lines starting with "- ")
 *   - inline marks: **bold** and `code`
 *
 * ADF does NOT interpret markdown inside a text node — `**bold**` would
 * render literally — so inline markers must be converted to `marks` on
 * text nodes, not left as raw characters.
 *
 * This is not a full CommonMark parser. Italics, links, headings, fenced
 * code blocks are intentionally absent. Add them when the output renderer
 * starts emitting them.
 */
export declare function fromMarkdown(text: string): AdfNode;
/**
 * Tokenize a single line into ADF text nodes, honoring `**strong**` and `` `code` ``.
 * Falls back to plain text for anything unmatched. Empty strings are dropped.
 */
export declare function parseInline(s: string): AdfNode[];
//# sourceMappingURL=adf.d.ts.map