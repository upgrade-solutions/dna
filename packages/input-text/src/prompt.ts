import { Layer } from './types'

/**
 * Structural skeleton — NOT a concrete example.
 *
 * Early versions used a full lending/Loan example here; smaller local models
 * in JSON mode would copy those literal names back verbatim instead of deriving
 * new names from the user's text. Using angle-bracket placeholders forces the
 * model to substitute, because `<Resource>` / `<Action>` aren't valid output.
 */
const OPERATIONAL_SKELETON = `{
  "operational": {
    "domain": {
      "name": "<domain-leaf>",
      "path": "<root>.<mid>.<leaf>",
      "resources": [
        {
          "name": "<ResourceInPascalCase>",
          "attributes": [
            { "name": "<attribute>", "type": "<string|text|number|boolean|date|datetime|enum|reference>", "required": true },
            { "name": "<enumAttribute>", "type": "enum", "values": ["<valueA>", "<valueB>"] }
          ],
          "actions": [
            { "name": "<ActionInPascalCase>" }
          ]
        }
      ]
    },
    "capabilities": [
      { "resource": "<Resource>", "action": "<Action>", "name": "<Resource>.<Action>" }
    ],
    "causes": [
      { "capability": "<Resource>.<Action>", "source": "user | schedule | webhook | capability" }
    ],
    "rules": [
      { "capability": "<Resource>.<Action>", "type": "access", "allow": [{ "role": "<role>" }] },
      { "capability": "<Resource>.<Action>", "type": "condition", "conditions": [{ "attribute": "<resource>.<attribute>", "operator": "eq", "value": "<value>" }] }
    ],
    "outcomes": [
      { "capability": "<Resource>.<Action>", "changes": [{ "attribute": "<resource>.<attribute>", "set": "<value>" }] }
    ],
    "roles": [
      { "name": "<RoleInPascalCase>", "description": "<what this role does or grants>" }
    ],
    "users": [
      { "name": "<user-kebab-id>", "display_name": "<Full Name>", "roles": ["<RoleInPascalCase>"] }
    ],
    "tasks": [
      { "name": "<TaskInPascalCase>", "role": "<RoleInPascalCase>", "capability": "<Resource>.<Action>" }
    ],
    "processes": [
      {
        "name": "<ProcessInPascalCase>",
        "description": "<process description>",
        "operator": "<RoleInPascalCase>",
        "steps": [
          { "id": "s1", "task": "<TaskInPascalCase>" },
          { "id": "s2", "task": "<TaskInPascalCase>", "depends_on": ["s1"] }
        ]
      }
    ]
  }
}`

const PRODUCT_SKELETON = `{
  "product": {
    "core": {
      "domain": { "name": "<domain-leaf>", "path": "<root>.<mid>.<leaf>" },
      "resources": [
        {
          "name": "<ResourceInPascalCase>",
          "resource": "<OperationalResource>",
          "fields": [
            { "name": "<field>", "type": "<string|text|number|boolean|date|datetime|enum|reference>" }
          ],
          "actions": [
            { "name": "<ActionInPascalCase>" }
          ]
        }
      ],
      "operations": [
        {
          "resource": "<Resource>",
          "action": "<Action>",
          "name": "<Resource>.<Action>",
          "capability": "<Resource>.<Action>"
        }
      ]
    },
    "api": {
      "namespace": {
        "name": "<NamespaceInPascalCase>",
        "path": "/<kebab-prefix>",
        "domain": "<root>.<mid>.<leaf>"
      },
      "endpoints": [
        {
          "method": "GET | POST | PUT | PATCH | DELETE",
          "path": "/<kebab>/:id",
          "operation": "<Resource>.<Action>"
        }
      ]
    },
    "ui": {
      "layout": {
        "name": "<LayoutInPascalCase>",
        "type": "sidebar | full-width | split-panel | centered | blank | universal | marketing"
      },
      "pages": [
        { "name": "<PageInPascalCase>", "resource": "<Resource>" }
      ],
      "routes": [
        { "path": "/<kebab>", "page": "<PageInPascalCase>" }
      ]
    }
  }
}`

const TECHNICAL_SKELETON = `{
  "technical": {
    "environments": [
      { "name": "dev | staging | prod" }
    ],
    "providers": [
      {
        "name": "<kebab-name>",
        "type": "cloud | auth | payments | database | storage | messaging | monitoring | other"
      }
    ],
    "constructs": [
      {
        "name": "<kebab-name>",
        "category": "compute | storage | network",
        "type": "function | container | server | worker | database | cache | filestore | queue | gateway | loadbalancer | cdn"
      }
    ],
    "variables": [
      { "name": "<SCREAMING_SNAKE_CASE>", "source": "env | secret | output | literal" }
    ],
    "cells": [
      {
        "name": "<kebab-name>",
        "dna": "product/api | product/ui | operational/<resource>",
        "adapter": { "type": "nestjs | express | nextjs | nuxt | rails | django | fastapi | spring | …" }
      }
    ]
  }
}`

const LAYER_GUIDE: Record<Layer, string> = {
  operational: [
    'operational (required when the text describes a business):',
    '  The operational layer is modeled around the Actor > Action > Resource triad:',
    '    — a Resource is a thing the business tracks (Loan, Invoice, Post)',
    '    — an Action is what gets performed on a Resource (Approve, Issue, Publish)',
    '    — the Actor (who does it) is a Role, referenced by Rules (access), Tasks (assignment), Users (who holds which role), and Processes (operator) — never inline on the Capability itself.',
    '  domain: { name, path, domains?, resources }',
    '    — resources is an ARRAY of { name, attributes: [{name,type,required?,values?}], actions: [{name}] }',
    '    — ALWAYS include resources when the text mentions entities; do not leave it empty',
    '  capabilities: ARRAY of { resource: "<singular>", action: "<singular>", name: "Resource.Action" }',
    '    — one entry per Resource+Action pair; resource/action are single strings, NOT arrays',
    '    — every Action MUST be paired with a Resource; an Action without a Resource is invalid',
    '  causes: ARRAY of { capability: "Resource.Action", source: "user" | "schedule" | "webhook" | "capability" }',
    '    — source is one of those four literal strings ONLY; a role like "underwriter" is NOT a valid source',
    '    — pick source from the text: a human doing it = "user"; a cron/timer = "schedule";',
    '      an inbound HTTP event = "webhook"; triggered by another Capability finishing = "capability".',
    '      Do NOT round-robin or distribute evenly across the four values. Default to "user" when unclear.',
    '  rules: ARRAY of { capability, type: "access" | "condition", allow?: [{role}], conditions?: [...] }',
    '    — "access" rules carry roles (the Actor); "condition" rules carry attribute predicates.',
    '    — role values here are Role names, PascalCase (e.g. "Underwriter", "Borrower").',
    '  outcomes: ARRAY of { capability, changes: [{attribute, set}] }',
    '  relationships (optional): ARRAY of { name, from, to, attribute, cardinality: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many" }',
    '    — match cardinality to the text: "each X has many Y" → one-to-many from X to Y.',
    '  roles (optional): ARRAY of { name, description?, domain?, parent? }',
    '    — a Role is a PascalCase job title or permission bundle (ClosingSpecialist, Underwriter, Admin) — the Actor in the triad. ALWAYS include when the text names roles or job titles performing work. `parent` captures org-chart hierarchy (ClosingSpecialist parent LendingManager).',
    '  users (optional): ARRAY of { name, display_name?, roles: [string], email?, active? }',
    '    — a User is a named individual or service account holding one or more Roles.',
    '  tasks (optional): ARRAY of { name, role, capability, description? }',
    '    — a Task is "Role performs one Capability". Use when the text says who does what.',
    '  processes (optional): ARRAY of { name, description?, operator?, steps: [{id, task, depends_on?: [id]}] }',
    '    — a Process is a named, owned DAG of Tasks (an SOP / workflow).',
    '    — ALWAYS include processes when the text enumerates named workflows or end-to-end flows.',
  ].join('\n'),
  product: [
    'product (INCLUDE ONLY IF the input text explicitly describes software being built — UI screens, API endpoints, resources, pages, fields). Three sub-layers:',
    '  core: { domain, resources: [{name, resource, fields, actions}], operations: [{resource, action, name: "Resource.Action", capability}] }',
    '    — Resource is PascalCase singular and maps 1:1 to an Operational Resource (same name by convention; the `resource` field is the explicit cross-layer reference).',
    '    — Operation name is "Resource.Action" and should reference a Capability with the same "Resource.Action" form from the operational layer.',
    '  api:  { namespace: {name, path, domain}, endpoints: [{method, path, operation: "Resource.Action"}] }',
    '    — method is one of GET | POST | PUT | PATCH | DELETE. Path is URL-style with :id placeholders.',
    '    — Include an endpoint only if the text names an API surface or HTTP contract.',
    '  ui:   { layout: {name, type}, pages: [{name, resource}], routes: [{path, page}] }',
    '    — layout.type is one of: sidebar | full-width | split-panel | centered | blank | universal | marketing.',
    '    — Include a page/route only if the text names a screen, URL, or user-facing view.',
    'If the text describes only business process / SOP and names no software, OMIT this layer entirely. Do NOT invent endpoints, routes, or schemas to pad the response.',
  ].join('\n'),
  technical: [
    'technical (INCLUDE ONLY IF the input text explicitly describes deployment — cloud, infrastructure, regions, pipelines, deploy scripts). Shape:',
    '  environments: [{name: "dev" | "staging" | "prod"}]',
    '  providers:    [{name (kebab-case), type: "cloud" | "auth" | "payments" | "database" | "storage" | "messaging" | "monitoring" | "other"}]',
    '  constructs:   [{name (kebab-case), category: "compute" | "storage" | "network", type: "function" | "container" | "server" | "worker" | "database" | "cache" | "filestore" | "queue" | "gateway" | "loadbalancer" | "cdn"}]',
    '  variables:    [{name (SCREAMING_SNAKE_CASE), source: "env" | "secret" | "output" | "literal"}]',
    '  cells:        [{name (kebab-case), dna: "product/api" | "product/ui" | "operational/<resource>", adapter: {type: <framework>}}]',
    'If the text does not describe deployment, OMIT this layer entirely. Do NOT invent AWS/GCP/Azure values, regions, ARNs, or tooling.',
  ].join('\n'),
}

export function buildSystemPrompt(layers: Layer[], instructions?: string): string {
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
    '- Operational DNA is modeled as Actor > Action > Resource. Resources use PascalCase singular (Loan, Invoice, Borrower). Actions use PascalCase (Apply, Approve). Every Action must be paired with a Resource.',
    '- Capability name is always "Resource.Action" — e.g. { "resource": "Loan", "action": "Apply", "name": "Loan.Apply" }.',
    '- Every Resource mentioned in the text MUST appear in domain.resources with its attributes and actions.',
    '- Attributes have: name, type (string | text | number | boolean | date | datetime | enum | reference), optional required, optional values (for enums).',
    '- Domain path is dot-separated lowercase (acme.finance.lending).',
    '- Only include primitives implied by the text; do not invent.',
    '- Derive EVERY name (resources, actions, attributes, roles, domain path) from the input text ONLY. Do not copy names from the structural skeleton below.',
    '- The skeleton uses <placeholder> tokens to show shape, not content. Any `<...>` string in your response is an error.',
    '- NEVER invent values to fill a layer. If the input text does not describe product/technical details, OMIT those layers from the response.',
    '- An empty or partial section is always better than an invented one.',
  ]

  if (layers.includes('operational')) {
    lines.push(
      '',
      'Structural skeleton — operational layer. Treat <placeholder> tokens as slots to fill from the input text; never emit them literally:',
      '',
      OPERATIONAL_SKELETON,
    )
  }

  if (layers.includes('product')) {
    lines.push(
      '',
      'Structural skeleton — product layer (core / api / ui). Include only sub-sections the text describes; omit the layer entirely if no software is named:',
      '',
      PRODUCT_SKELETON,
    )
  }

  if (layers.includes('technical')) {
    lines.push(
      '',
      'Structural skeleton — technical layer. Include only if the text names deployment details; omit the layer entirely otherwise:',
      '',
      TECHNICAL_SKELETON,
    )
  }

  if (instructions) {
    lines.push('', 'Additional instructions:', instructions)
  }
  return lines.join('\n')
}

export function buildUserPrompt(text: string, layers: Layer[]): string {
  return [
    `Requested layers: ${layers.join(', ')}.`,
    '',
    'Text:',
    text,
  ].join('\n')
}
