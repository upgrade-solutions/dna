"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSystemPrompt = buildSystemPrompt;
exports.buildUserPrompt = buildUserPrompt;
const OPERATIONAL_EXAMPLE = `{
  "operational": {
    "domain": {
      "name": "lending",
      "path": "acme.finance.lending",
      "nouns": [
        {
          "name": "Loan",
          "attributes": [
            { "name": "amount", "type": "number", "required": true },
            { "name": "status", "type": "enum", "values": ["pending", "active", "repaid"] }
          ],
          "verbs": [
            { "name": "Apply" },
            { "name": "Approve" }
          ]
        }
      ]
    },
    "capabilities": [
      { "noun": "Loan", "verb": "Apply", "name": "Loan.Apply" },
      { "noun": "Loan", "verb": "Approve", "name": "Loan.Approve" }
    ],
    "causes": [
      { "capability": "Loan.Apply", "source": "user" },
      { "capability": "Loan.Approve", "source": "user" }
    ],
    "rules": [
      { "capability": "Loan.Approve", "type": "access", "allow": [{ "role": "underwriter" }] },
      { "capability": "Loan.Approve", "type": "condition", "conditions": [{ "attribute": "loan.status", "operator": "eq", "value": "pending" }] }
    ],
    "outcomes": [
      { "capability": "Loan.Apply", "changes": [{ "attribute": "loan.status", "set": "pending" }] },
      { "capability": "Loan.Approve", "changes": [{ "attribute": "loan.status", "set": "active" }] }
    ]
  }
}`;
const LAYER_GUIDE = {
    operational: [
        'operational (required when the text describes a business):',
        '  domain: { name, path, domains?, nouns }',
        '    — nouns is an ARRAY of { name, attributes: [{name,type,required?,values?}], verbs: [{name}] }',
        '    — ALWAYS include nouns when the text mentions entities; do not leave it empty',
        '  capabilities: ARRAY of { noun: "<singular>", verb: "<singular>", name: "Noun.Verb" }',
        '    — one entry per Noun+Verb pair; noun/verb are single strings, NOT arrays',
        '  causes: ARRAY of { capability: "Noun.Verb", source: "user" | "schedule" | "webhook" | "capability" }',
        '    — source is one of those four literal strings ONLY; a role like "underwriter" is NOT a valid source',
        '  rules: ARRAY of { capability, type: "access" | "condition", allow?: [{role}], conditions?: [...] }',
        '    — "access" rules carry roles; "condition" rules carry attribute predicates',
        '  outcomes: ARRAY of { capability, changes: [{attribute, set}] }',
        '  relationships (optional): ARRAY of { name, from, to, attribute, cardinality }',
    ].join('\n'),
    product: [
        'product (optional, only if the text clearly describes software being built):',
        '  core: { resources, actions, operations, roles, fields }',
        '  api: { namespace, endpoints, schemas? }',
        '  ui: { layouts, pages, routes, blocks }',
    ].join('\n'),
    technical: [
        'technical (optional, only if deployment is described):',
        '  { cells, constructs, providers, environments, variables, outputs, scripts, views }',
    ].join('\n'),
};
function buildSystemPrompt(layers, instructions) {
    const lines = [
        'You convert freeform business descriptions into DNA — a JSON description language for business systems.',
        'DNA has three layers: operational (what the business does), product (what gets built), technical (how it gets deployed).',
        '',
        'Emit ONLY valid JSON. No prose, no markdown fences, no comments.',
        'The top-level object MUST have one key per requested layer — e.g. { "operational": { ... } }.',
        'Do NOT emit the layer contents at the top level; always wrap them under the layer key.',
        '',
        'Layer shapes:',
        '',
        layers.map((l) => LAYER_GUIDE[l]).join('\n\n'),
        '',
        'Hard rules:',
        '- Nouns use PascalCase singular (Loan, Invoice, Borrower). Verbs use PascalCase (Apply, Approve).',
        '- Capability name is always "Noun.Verb" — e.g. { "noun": "Loan", "verb": "Apply", "name": "Loan.Apply" }.',
        '- Every Noun mentioned in the text MUST appear in domain.nouns with its attributes and verbs.',
        '- Attributes have: name, type (string | text | number | boolean | date | datetime | enum | reference), optional required, optional values (for enums).',
        '- Domain path is dot-separated lowercase (acme.finance.lending).',
        '- Only include primitives implied by the text; do not invent.',
    ];
    if (layers.includes('operational')) {
        lines.push('', 'Full example of a valid response when operational is requested (note the outer "operational" wrapper):', '', OPERATIONAL_EXAMPLE);
    }
    if (instructions) {
        lines.push('', 'Additional instructions:', instructions);
    }
    return lines.join('\n');
}
function buildUserPrompt(text, layers) {
    return [
        `Requested layers: ${layers.join(', ')}.`,
        '',
        'Text:',
        text,
    ].join('\n');
}
//# sourceMappingURL=prompt.js.map