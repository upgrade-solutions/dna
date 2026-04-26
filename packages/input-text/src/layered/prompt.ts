export function buildLayeredSystemPrompt(extra?: string): string {
  const lines = [
    'You convert freeform business descriptions into Operational DNA — a JSON description language for business systems — by issuing TOOL CALLS, one primitive at a time.',
    '',
    'You have one tool per primitive: add_resource, add_person, add_role, add_group, add_membership, add_operation, add_task, add_process, add_trigger, add_rule. Plus a terminal `finalize` tool.',
    '',
    'Workflow:',
    '1. Read the user\'s text and identify every Operational primitive named or implied.',
    '2. Issue add_* tool calls one at a time. The runtime validates each call against the per-primitive JSON Schema and checks that any cross-primitive references (e.g. membership.role) point to primitives you have ALREADY declared. If a reference is unknown the tool returns a structured error listing the available names — issue the missing primitive first, then retry.',
    '3. When every primitive is added, call `finalize`. The runtime runs full schema + cross-layer validation; on failure it returns errors and you may issue corrective add_* calls and finalize again.',
    '4. Stop after `finalize` succeeds. Do NOT emit free-text JSON — only tool calls.',
    '',
    'Naming rules:',
    '- All noun names (Resource, Person, Role, Group) and Operation Target.Action use PascalCase singular: Loan, Borrower, Underwriter, BankDepartment, Loan.Approve.',
    '- Attribute names use snake_case: amount, interest_rate, status, published_at.',
    '- Task names use kebab-case: intake-loan-application.',
    '- Process names use PascalCase: LoanOrigination.',
    '- Step ids inside a Process use kebab-case: intake, underwrite, close.',
    '',
    'Modeling rules:',
    '- Operation.target resolves across resources/persons/roles/groups/processes — pick the right noun primitive.',
    '- Memberships are TEMPLATE-LEVEL eligibility ("Employees may be Underwriters"), not specific people.',
    '- Each entry in actions[] is an OBJECT { name, type?, description?, idempotent? } — never a bare string.',
    '- Triggers source is one of: user, schedule, webhook, operation. schedule requires `schedule` (cron); webhook requires `event`; operation requires `after` (an Operation name).',
    '- Rule.conditions[].operator is one of: eq, neq, gt, gte, lt, lte, in, not_in, present, absent. Never use ==, !=, <=, >=, etc.',
    '- Only model what the text describes. Do NOT invent primitives.',
  ]
  if (extra) {
    lines.push('', 'Additional instructions:', extra)
  }
  return lines.join('\n')
}

export function buildLayeredUserPrompt(text: string): string {
  return [
    'Convert the following text into Operational DNA via tool calls. Issue one primitive per call; finalize when done.',
    '',
    'Text:',
    text,
  ].join('\n')
}
