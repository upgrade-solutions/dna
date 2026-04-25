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
            { "name": "<ActionInPascalCase>", "type": "<read|write|destructive>" }
          ]
        }
      ],
      "persons": [
        { "name": "<PersonInPascalCase>", "description": "<the kind of human this is>" }
      ],
      "groups": [
        { "name": "<GroupInPascalCase>", "description": "<the work-unit/container that scopes Roles>", "attributes": [{ "name": "<attr>", "type": "string" }] }
      ],
      "roles": [
        { "name": "<RoleInPascalCase>", "description": "<what this role does>", "scope": "<GroupInPascalCase>" },
        { "name": "<SystemRoleInPascalCase>", "description": "<what this system actor does>", "system": true }
      ]
    },
    "memberships": [
      { "name": "<PersonRoleNameInPascalCase>", "person": "<PersonInPascalCase>", "role": "<RoleInPascalCase>" }
    ],
    "operations": [
      { "target": "<TargetNounInPascalCase>", "action": "<Action>", "name": "<TargetNoun>.<Action>" }
    ],
    "triggers": [
      { "operation": "<TargetNoun>.<Action>", "source": "user | schedule | webhook | operation | signal" }
    ],
    "rules": [
      { "operation": "<TargetNoun>.<Action>", "type": "access", "allow": [{ "role": "<RoleInPascalCase>" }] },
      { "name": "<RuleInPascalCase>", "operation": "<TargetNoun>.<Action>", "type": "condition", "conditions": [{ "attribute": "<target>.<attribute>", "operator": "eq", "value": "<value>" }] }
    ],
    "outcomes": [
      { "operation": "<TargetNoun>.<Action>", "changes": [{ "attribute": "<target>.<attribute>", "set": "<value>" }] }
    ],
    "tasks": [
      { "name": "<task-kebab-id>", "actor": "<RoleOrPersonInPascalCase>", "operation": "<TargetNoun>.<Action>" }
    ],
    "processes": [
      {
        "name": "<ProcessInPascalCase>",
        "description": "<process description>",
        "operator": "<RoleOrPersonInPascalCase>",
        "startStep": "s1",
        "steps": [
          { "id": "s1", "task": "<task-kebab-id>" },
          { "id": "s2", "task": "<task-kebab-id>", "depends_on": ["s1"], "conditions": ["<RuleInPascalCase>"], "else": "abort" }
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
          "name": "<Resource>.<Action>"
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
    '  The operational layer is organizational modeling — the NOUNS the organization deals with and the VERBS that bind them. It is modeled around the Actor > Action > Subject triad:',
    '    — a SUBJECT (target) is one of four noun primitives: Resource (entity — Loan, Invoice, Post), Person (individual — Patient, Borrower, Employee), Role (position — Underwriter, Doctor), or Group (work-unit/container — BankDepartment, Hospital, Case).',
    '    — an ACTION is a verb the subject supports (Approve, Issue, Publish, Admit).',
    '    — the ACTOR (who does it) is a Role or Person, referenced by Rules (access via Rule.allow[].role), Tasks (Task.actor), and Processes (operator) — never inline on the Operation itself.',
    '  domain: { name, path, domains?, resources?, persons?, groups?, roles? } — four noun collections (all optional but at least one usually present).',
    '    — Resources: entity templates the org manages (Loan, Account, Document, Invoice). Have name, attributes, actions, optional parent.',
    '    — Persons: individual templates (Customer, Employee, Patient, Borrower). Same shape as Resources — name, attributes, actions, optional parent. Use Person when modeling humans the org deals with.',
    '    — Groups: work-unit / container templates (BankDepartment, Hospital, Case, Workspace, Family). Same shape as Resources — Groups scope Role Memberships.',
    '    — Roles: position/capacity templates (Underwriter, Doctor, LeadCounsel). Have name, optional scope (the Group or Person they are exercised within), optional system: true (for non-human actors), optional resource (Resource that backs a system Role), optional actions (org-admin lifecycle on the Role itself).',
    '    — Each entry in actions[] is an OBJECT: { name, description?, type?: "read"|"write"|"destructive", idempotent? } — never a bare string.',
    '    — ALWAYS populate the noun collections that the text describes; do not leave them empty.',
    '  memberships (top-level array, optional): ARRAY of { name, person, role, group? }',
    '    — A Membership is a TEMPLATE-LEVEL eligibility statement: "Persons of type X may hold Roles of type Y, optionally in Groups of type Z." Captures who-can-fill-what at the type level.',
    '    — group is OPTIONAL. Inferred from Role.scope for single-scope Roles; required when Role has multi-scope (Role.scope is an array) to disambiguate.',
    '    — Memberships do NOT enumerate specific people (Joe, Jane). Instance-level user bindings live in Product/Technical layers.',
    '  operations: ARRAY of { target: "<noun>", action: "<verb>", name: "Target.Action" }',
    '    — target resolves across resources/persons/roles/groups (any noun primitive). action must match an entry in target.actions[].',
    '    — one entry per Target+Action pair; target/action are single strings, NOT arrays.',
    '  triggers: ARRAY of { operation: "Target.Action" | process: "ProcessName", source: "user" | "schedule" | "webhook" | "operation" | "signal" }',
    '    — A Trigger targets EITHER an Operation (ad-hoc invocation) OR a Process (SOP kickoff), not both.',
    '    — source is one of those literal strings ONLY; pick it from the text. Default to "user" when unclear.',
    '  rules: ARRAY of { name?, operation, type: "access" | "condition", allow?: [{role}], conditions?: [...] }',
    '    — "access" rules carry actor references (Role or Person names — both are valid actors); "condition" rules carry attribute predicates.',
    '    — condition rules SHOULD have a PascalCase `name` so Steps can reference them via `step.conditions[]`.',
    '  outcomes: ARRAY of { operation, changes: [{attribute, set}], initiates?: [...], emits?: [...] }',
    '  relationships (optional): ARRAY of { name, from, to, attribute, cardinality: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many" }',
    '    — from/to may reference any noun primitive (Resource, Person, Role, or Group).',
    '  tasks (optional): ARRAY of { name, actor, operation, description? }',
    '    — a Task is "Actor performs one Operation". Actor is a Role (internal positions like Underwriter) OR a Person (external actors like Borrower).',
    '  processes (optional): ARRAY of { name, description?, operator, startStep, steps: [{id, task, depends_on?, conditions?, else?}] }',
    '    — a Process is a named, owned DAG of Steps (an SOP / workflow). `startStep` names the first Step (ASL `StartAt` convention).',
    '    — Each Step references exactly one Task. `conditions` is an array of Rule names (referencing condition Rules). `else` is a sibling step id or "abort".',
    '    — ALWAYS include processes when the text enumerates named workflows or end-to-end flows.',
  ].join('\n'),
  product: [
    'product (INCLUDE ONLY IF the input text explicitly describes software being built — UI screens, API endpoints, resources, pages, fields). Three sub-layers:',
    '  core: { domain, resources: [{name, resource, fields, actions}], operations: [{resource, action, name: "Resource.Action"}] }',
    '    — Resource is PascalCase singular and maps 1:1 to an Operational Resource (same name by convention; the `resource` field is the explicit cross-layer reference).',
    '    — Operation name is "Resource.Action" and is a surface projection of the same-named Operational Operation.',
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
    '- Operational DNA is organizational modeling: nouns the org deals with and verbs that bind them. The triad is Actor > Action > Subject. Subjects are nouns (Resource | Person | Role | Group). All names use PascalCase singular (Loan, Borrower, Underwriter, BankDepartment).',
    '- Operation name is "Target.Action" — e.g. { "target": "Loan", "action": "Apply", "name": "Loan.Apply" }. The `target` field resolves across all four noun collections (resources/persons/roles/groups).',
    '- Person, Role, Group are FIRST-CLASS primitives — distinct collections under domain (persons/roles/groups). Resource is for entities the org manages (Loan, Invoice). Person is for individual humans (Customer, Patient). Group is for work-units / containers Roles scope to (BankDepartment, Case). Role is for positions/capacities (Underwriter, Doctor).',
    '- Memberships are TEMPLATE-LEVEL eligibility statements ("Employees may be Underwriters"), not instance bindings ("Joe is the Underwriter of Eastern Branch"). Never enumerate specific named people.',
    '- Each entry in actions[] is an OBJECT — { name, description?, type?: "read"|"write"|"destructive", idempotent? } — never a bare string.',
    '- Every noun mentioned in the text MUST appear in the appropriate collection (resources/persons/roles/groups) with its attributes and actions.',
    '- Attributes have: name, type (string | text | number | boolean | date | datetime | enum | reference), optional required, optional values (for enums).',
    '- Domain path is dot-separated lowercase (acme.finance.lending).',
    '- Only include primitives implied by the text; do not invent.',
    '- Derive EVERY name (resources, persons, groups, roles, actions, attributes, domain path) from the input text ONLY. Do not copy names from the structural skeleton below.',
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
