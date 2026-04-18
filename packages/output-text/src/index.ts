/**
 * @dna-codes/output-text — render DNA as plain prose.
 *
 *   render(dna, options?)     → string                      // one combined document
 *   renderMany(dna, options?) → Array<{id, title, body}>    // one document per unit
 *
 * Both accept a `styles` map: `{ capability: 'user-story' | 'gherkin' | 'product-dna', ... }`.
 * The key set determines which unit types are emitted; the value picks the
 * body template. Default is `{ capability: 'user-story' }`.
 *
 * `user-story` and `gherkin` are action-shaped and only fit Capability — Noun
 * and Process always render as `product-dna` regardless of the style requested.
 */

import { capabilityTitle, renderCapability } from './capability'
import { nounTitle, renderNoun } from './noun'
import { processTitle, renderProcess } from './process'
import {
  Capability,
  DEFAULT_STYLES,
  DnaInput,
  Noun,
  OperationalDna,
  OperationalDomain,
  Process,
  RenderManyOptions,
  RenderOptions,
  Style,
  StyleMap,
  TextDocument,
  Unit,
} from './types'
import { joinSections, slugify } from './util'

const UNIT_ORDER: Unit[] = ['capability', 'noun', 'process']

export function render(dna: DnaInput, options: RenderOptions = {}): string {
  const op = dna.operational
  if (!op) return ''

  const styles = options.styles ?? DEFAULT_STYLES
  const title = options.title ?? op.domain.path ?? op.domain.name
  const intro = op.domain.description

  const sections: (string | null)[] = [
    title ? `# ${title}` : null,
    intro ?? null,
  ]

  for (const unit of UNIT_ORDER) {
    if (!styles[unit]) continue
    sections.push(renderUnitSection(unit, styles[unit]!, op))
  }

  const body = joinSections(sections)
  return body ? `${body}\n` : ''
}

export function renderMany(
  dna: DnaInput,
  options: RenderManyOptions = {},
): TextDocument[] {
  const styles = options.styles ?? DEFAULT_STYLES
  const op = dna.operational
  if (!op) return []

  const docs: TextDocument[] = []
  for (const unit of UNIT_ORDER) {
    const style = styles[unit]
    if (!style) continue
    docs.push(...unitDocs(unit, style, op))
  }
  return docs
}

function unitDocs(unit: Unit, style: Style, op: OperationalDna): TextDocument[] {
  switch (unit) {
    case 'capability':
      return (op.capabilities ?? []).map((c) => capabilityDoc(c, op, style))
    case 'noun':
      return collectNouns(op.domain).map((n) => nounDoc(n, op))
    case 'process':
      return (op.processes ?? []).map((p) => processDoc(p, op))
  }
}

function capabilityDoc(cap: Capability, op: OperationalDna, style: Style): TextDocument {
  return {
    id: `capability-${slugify(cap.name)}`,
    title: capabilityTitle(cap),
    body: renderCapability(cap, op, style),
  }
}

function nounDoc(n: Noun, op: OperationalDna): TextDocument {
  return {
    id: `noun-${slugify(n.name)}`,
    title: nounTitle(n),
    body: renderNoun(n, op),
  }
}

function processDoc(p: Process, op: OperationalDna): TextDocument {
  return {
    id: `process-${slugify(p.name)}`,
    title: processTitle(p),
    body: renderProcess(p, op),
  }
}

function renderUnitSection(unit: Unit, style: Style, op: OperationalDna): string | null {
  const docs = unitDocs(unit, style, op)
  if (!docs.length) return null
  const heading = unitHeading(unit)
  const parts = [`## ${heading}`]
  for (const d of docs) {
    parts.push(`### ${d.title}`)
    if (d.body) parts.push(d.body)
  }
  return parts.join('\n\n')
}

function unitHeading(unit: Unit): string {
  if (unit === 'capability') return 'Capabilities'
  if (unit === 'noun') return 'Domain model'
  return 'Processes'
}

function collectNouns(domain: OperationalDomain): Noun[] {
  const out = [...(domain.nouns ?? [])]
  for (const sub of domain.domains ?? []) out.push(...collectNouns(sub))
  return out
}

export { Style, StyleMap, Unit, TextDocument, RenderOptions, RenderManyOptions } from './types'
export { DEFAULT_STYLES } from './types'
export type { DnaInput } from './types'
