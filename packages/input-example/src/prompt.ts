/**
 * Prompt builders for the probabilistic mode.
 *
 * The system prompt declares the DNA shape contract and any hard rules.
 * The user prompt carries the actual text. Keep both deterministic —
 * same inputs → same prompt — so response variance comes only from the model.
 *
 * Delete this file entirely if your fork is deterministic-only.
 */

export function buildSystemPrompt(instructions?: string): string {
  const lines = [
    'You convert freeform business descriptions into DNA — a JSON description language for business systems.',
    '',
    'Emit ONLY valid JSON. No prose, no markdown fences, no comments.',
    'The top-level object must wrap the operational layer under an "operational" key.',
    '',
    'Operational shape:',
    '{',
    '  "operational": {',
    '    "domain": {',
    '      "name": "<leaf>",',
    '      "path": "<dot.separated.path>",',
    '      "nouns": [',
    '        { "name": "PascalCase", "attributes": [ { "name": "camelCase", "type": "string|number|boolean|date|enum|reference", "required": true } ] }',
    '      ]',
    '    },',
    '    "capabilities": [ { "noun": "Loan", "verb": "Apply", "name": "Loan.Apply" } ]',
    '  }',
    '}',
    '',
    'Hard rules:',
    '- Nouns are PascalCase singular (Loan, Invoice, Borrower).',
    '- Verbs are PascalCase (Apply, Approve, Ship).',
    '- Capability.name is always "Noun.Verb".',
    '- Omit fields you do not have evidence for. Do not invent.',
  ]
  if (instructions) {
    lines.push('', 'Additional instructions:', instructions)
  }
  return lines.join('\n')
}

export function buildUserPrompt(text: string): string {
  return ['Extract an operational DNA slice from the text below.', '', 'Text:', text].join('\n')
}
