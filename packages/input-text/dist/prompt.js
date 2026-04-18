"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSystemPrompt = buildSystemPrompt;
exports.buildUserPrompt = buildUserPrompt;
/**
 * Structural skeleton — NOT a concrete example.
 *
 * Early versions used a full lending/Loan example here; smaller local models
 * in JSON mode would copy those literal names back verbatim instead of deriving
 * new names from the user's text. Using angle-bracket placeholders forces the
 * model to substitute, because `<Noun>` / `<Verb>` aren't valid output.
 */
const OPERATIONAL_SKELETON = `{
  "operational": {
    "domain": {
      "name": "<domain-leaf>",
      "path": "<root>.<mid>.<leaf>",
      "nouns": [
        {
          "name": "<NounInPascalCase>",
          "attributes": [
            { "name": "<attribute>", "type": "<string|text|number|boolean|date|datetime|enum|reference>", "required": true },
            { "name": "<enumAttribute>", "type": "enum", "values": ["<valueA>", "<valueB>"] }
          ],
          "verbs": [
            { "name": "<VerbInPascalCase>" }
          ]
        }
      ]
    },
    "capabilities": [
      { "noun": "<Noun>", "verb": "<Verb>", "name": "<Noun>.<Verb>" }
    ],
    "causes": [
      { "capability": "<Noun>.<Verb>", "source": "user | schedule | webhook | capability" }
    ],
    "rules": [
      { "capability": "<Noun>.<Verb>", "type": "access", "allow": [{ "role": "<role>" }] },
      { "capability": "<Noun>.<Verb>", "type": "condition", "conditions": [{ "attribute": "<noun>.<attribute>", "operator": "eq", "value": "<value>" }] }
    ],
    "outcomes": [
      { "capability": "<Noun>.<Verb>", "changes": [{ "attribute": "<noun>.<attribute>", "set": "<value>" }] }
    ],
    "positions": [
      { "name": "<PositionInPascalCase>", "description": "<role description>" }
    ],
    "persons": [
      { "name": "<PersonFullName>", "position": "<PositionInPascalCase>" }
    ],
    "tasks": [
      { "name": "<TaskInPascalCase>", "position": "<PositionInPascalCase>", "capability": "<Noun>.<Verb>" }
    ],
    "processes": [
      {
        "name": "<ProcessInPascalCase>",
        "description": "<process description>",
        "operator": "<PositionInPascalCase>",
        "steps": [
          { "id": "s1", "task": "<TaskInPascalCase>" },
          { "id": "s2", "task": "<TaskInPascalCase>", "depends_on": ["s1"] }
        ]
      }
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
        '    — pick source from the text: a human doing it = "user"; a cron/timer = "schedule";',
        '      an inbound HTTP event = "webhook"; triggered by another Capability finishing = "capability".',
        '      Do NOT round-robin or distribute evenly across the four values. Default to "user" when unclear.',
        '  rules: ARRAY of { capability, type: "access" | "condition", allow?: [{role}], conditions?: [...] }',
        '    — "access" rules carry roles; "condition" rules carry attribute predicates',
        '  outcomes: ARRAY of { capability, changes: [{attribute, set}] }',
        '  relationships (optional): ARRAY of { name, from, to, attribute, cardinality: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many" }',
        '    — match cardinality to the text: "each X has many Y" → one-to-many from X to Y.',
        '  positions (optional): ARRAY of { name, description?, roles?: [string] }',
        '    — a Position is a job title ("Case Manager", "Underwriter"). ALWAYS include when the text names roles performing work.',
        '  persons (optional): ARRAY of { name, position }',
        '    — a Person is a named individual filling a Position.',
        '  tasks (optional): ARRAY of { name, position, capability, description? }',
        '    — a Task is "Position performs one Capability". Use when the text says who does what.',
        '  processes (optional): ARRAY of { name, description?, operator?, steps: [{id, task, depends_on?: [id]}] }',
        '    — a Process is a named, owned DAG of Tasks (an SOP / workflow).',
        '    — ALWAYS include processes when the text enumerates named workflows or end-to-end flows.',
    ].join('\n'),
    product: [
        'product (INCLUDE ONLY IF the input text explicitly describes software being built — UI screens, API endpoints, resources, pages, fields at the UI/API level).',
        'If the text describes only a business process or SOP without naming software, OMIT this layer entirely — do not guess endpoints, routes, or schemas.',
        'When included:',
        '  core: { resources, actions, operations, roles, fields }',
        '  api:  { namespace, endpoints, schemas? }',
        '  ui:   { layouts, pages, routes, blocks }',
    ].join('\n'),
    technical: [
        'technical (INCLUDE ONLY IF the input text explicitly describes deployment — cloud provider, infrastructure, regions, pipelines, deploy scripts).',
        'If the text does not describe deployment, OMIT this layer entirely — do not invent AWS/GCP/Azure values, regions, ARNs, or tooling.',
        'When included: { cells, constructs, providers, environments, variables, outputs, scripts, views }',
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
        '- Derive EVERY name (nouns, verbs, attributes, roles, domain path) from the input text ONLY. Do not copy names from the structural skeleton below.',
        '- The skeleton uses <placeholder> tokens to show shape, not content. Any `<...>` string in your response is an error.',
        '- NEVER invent values to fill a layer. If the input text does not describe product/technical details, OMIT those layers from the response.',
        '- An empty or partial section is always better than an invented one.',
    ];
    if (layers.includes('operational')) {
        lines.push('', 'Structural skeleton showing the shape of a valid operational response. Treat <placeholder> tokens as slots to fill from the input text — NEVER emit them literally:', '', OPERATIONAL_SKELETON);
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