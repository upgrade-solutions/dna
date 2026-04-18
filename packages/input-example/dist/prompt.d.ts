/**
 * Prompt builders for the probabilistic mode.
 *
 * The system prompt declares the DNA shape contract and any hard rules.
 * The user prompt carries the actual text. Keep both deterministic —
 * same inputs → same prompt — so response variance comes only from the model.
 *
 * Delete this file entirely if your fork is deterministic-only.
 */
export declare function buildSystemPrompt(instructions?: string): string;
export declare function buildUserPrompt(text: string): string;
//# sourceMappingURL=prompt.d.ts.map