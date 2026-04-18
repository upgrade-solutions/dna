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

import { AdfNode } from './types'

export function extractText(description: unknown): string {
  if (description == null) return ''
  if (typeof description === 'string') return description
  if (typeof description !== 'object') return ''
  return walk(description as AdfNode).replace(/\n{3,}/g, '\n\n').trim()
}

function walk(node: AdfNode): string {
  if (!node || typeof node !== 'object') return ''
  if (node.type === 'text' && typeof node.text === 'string') return node.text
  if (node.type === 'hardBreak') return '\n'

  const inner = (node.content ?? []).map(walk).join(
    isBlock(node.type) ? '' : '',
  )

  if (isBlock(node.type)) return inner + '\n\n'
  if (node.type === 'listItem') return '- ' + inner + '\n'
  return inner
}

function isBlock(type: string | undefined): boolean {
  return (
    type === 'paragraph' ||
    type === 'heading' ||
    type === 'bulletList' ||
    type === 'orderedList' ||
    type === 'blockquote'
  )
}

/**
 * Minimal markdown → ADF converter covering what @dna-codes/output-text emits:
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
export function fromMarkdown(text: string): AdfNode {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
  return {
    version: 1,
    type: 'doc',
    content: blocks.map(blockToAdf),
  }
}

function blockToAdf(block: string): AdfNode {
  const lines = block.split('\n')
  if (lines.every((l) => /^-\s+/.test(l))) {
    return {
      type: 'bulletList',
      content: lines.map((l) => ({
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: parseInline(l.replace(/^-\s+/, '')),
          },
        ],
      })),
    }
  }

  const content: AdfNode[] = []
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) content.push({ type: 'hardBreak' })
    content.push(...parseInline(lines[i]))
  }
  return { type: 'paragraph', content }
}

/**
 * Tokenize a single line into ADF text nodes, honoring `**strong**` and `` `code` ``.
 * Falls back to plain text for anything unmatched. Empty strings are dropped.
 */
export function parseInline(s: string): AdfNode[] {
  const nodes: AdfNode[] = []
  let i = 0
  while (i < s.length) {
    if (s.startsWith('**', i)) {
      const end = s.indexOf('**', i + 2)
      if (end > i + 2) {
        nodes.push({
          type: 'text',
          text: s.slice(i + 2, end),
          marks: [{ type: 'strong' }],
        })
        i = end + 2
        continue
      }
    }
    if (s[i] === '`') {
      const end = s.indexOf('`', i + 1)
      if (end > i + 1) {
        nodes.push({
          type: 'text',
          text: s.slice(i + 1, end),
          marks: [{ type: 'code' }],
        })
        i = end + 1
        continue
      }
    }
    let end = s.length
    const boldAt = s.indexOf('**', i)
    const codeAt = s.indexOf('`', i)
    if (boldAt > i) end = Math.min(end, boldAt)
    if (codeAt > i) end = Math.min(end, codeAt)
    const chunk = s.slice(i, end)
    if (chunk) nodes.push({ type: 'text', text: chunk })
    i = end
  }
  return nodes
}
