import { Layer } from './types'

const LAYER_GUIDE: Record<Layer, string> = {
  operational: [
    '- operational.domain: { name, path, domains?, nouns? }. Nouns have attributes (name, type) and verbs (name).',
    '- operational.capabilities: Noun.Verb pairs, e.g. { noun, verb, name: "Noun.Verb" }.',
    '- operational.causes: what starts a capability ({ capability, source: "user"|"schedule"|"webhook"|"capability" }).',
    '- operational.rules: access or condition rules on a capability.',
    '- operational.outcomes: state changes after a capability executes.',
    '- operational.relationships (optional): { name, from, to, attribute, cardinality }.',
  ].join('\n'),
  product: [
    '- product.core: { resources, actions, operations, roles, fields } — optional, only if the text clearly implies a product.',
    '- product.api: { namespace, endpoints, schemas? } — optional.',
    '- product.ui: { layouts, pages, routes, blocks } — optional.',
  ].join('\n'),
  technical: [
    '- technical: { cells, constructs, providers, environments, variables, outputs, scripts, views } — optional, only if deployment is described.',
  ].join('\n'),
}

export function buildSystemPrompt(layers: Layer[], instructions?: string): string {
  const lines = [
    'You convert freeform business descriptions into DNA — a JSON description language for business systems.',
    'DNA has three layers: operational (what the business does), product (what gets built), technical (how it gets deployed).',
    '',
    'Emit ONLY valid JSON. No prose, no markdown fences, no comments. The top-level object has keys for the requested layers:',
    '',
    layers.map((l) => LAYER_GUIDE[l]).join('\n'),
    '',
    'Rules:',
    '- Only include layers explicitly requested by the user.',
    '- Only include primitives clearly implied by the text; omit speculation.',
    '- Nouns use PascalCase singular (Loan, Invoice). Verbs use PascalCase (Apply, Approve).',
    '- Capability name is always "Noun.Verb".',
    '- Domain path is dot-separated (acme.finance.lending).',
  ]
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
