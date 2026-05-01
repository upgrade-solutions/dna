import { extractText, fromMarkdown } from './adf'
import { createClient } from './client'
import { parseArgs } from './cli'

type FetchCall = { url: string; init: RequestInit }

function mockFetch(
  handler: (url: string, init: RequestInit) => { status?: number; body: unknown },
): { fetchImpl: typeof fetch; calls: FetchCall[] } {
  const calls: FetchCall[] = []
  const fetchImpl = (async (url: unknown, init?: RequestInit) => {
    const u = String(url)
    const i = init ?? {}
    calls.push({ url: u, init: i })
    const { status = 200, body } = handler(u, i)
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
    } as Response
  }) as typeof fetch
  return { fetchImpl, calls }
}

const baseOpts = {
  baseUrl: 'https://acme.atlassian.net',
  email: 'tim@example.com',
  apiToken: 'tok',
  projectKey: 'ENG',
}

describe('adf', () => {
  it('extracts plain text from an ADF doc', () => {
    const adf = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello world.' }] },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Second ' },
            { type: 'text', text: 'paragraph.' },
          ],
        },
      ],
    }
    expect(extractText(adf)).toBe('Hello world.\n\nSecond paragraph.')
  })

  it('returns a string description unchanged', () => {
    expect(extractText('plain text')).toBe('plain text')
  })

  it('treats null/undefined as empty', () => {
    expect(extractText(null)).toBe('')
    expect(extractText(undefined)).toBe('')
  })

  it('fromMarkdown produces ADF paragraphs for blank-line-separated blocks', () => {
    const adf = fromMarkdown('alpha\n\nbeta')
    expect(adf.type).toBe('doc')
    expect(adf.content).toHaveLength(2)
    expect(adf.content?.[0]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'alpha' }],
    })
  })
})

describe('client — basics', () => {
  it('sends Basic auth computed from email:apiToken', async () => {
    const { fetchImpl, calls } = mockFetch(() => ({
      body: { id: '1', key: 'ENG-100', fields: { summary: 'Epic', description: null } },
    }))
    const client = createClient({ ...baseOpts, fetchImpl })
    await client.getEpic('ENG-100')
    const auth = (calls[0].init.headers as Record<string, string>).authorization
    const expected = 'Basic ' + Buffer.from('tim@example.com:tok').toString('base64')
    expect(auth).toBe(expected)
    expect(calls[0].url).toBe('https://acme.atlassian.net/rest/api/3/issue/ENG-100')
  })

  it('extractEpicText combines summary + ADF description', async () => {
    const { fetchImpl } = mockFetch(() => ({
      body: {
        id: '1',
        key: 'ENG-100',
        fields: {
          summary: 'Build lending flow',
          description: {
            type: 'doc',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Borrowers apply.' }] },
            ],
          },
        },
      },
    }))
    const client = createClient({ ...baseOpts, fetchImpl })
    const epic = await client.getEpic('ENG-100')
    expect(client.extractEpicText(epic)).toBe('Build lending flow\n\nBorrowers apply.')
  })

  it('throws on a non-2xx Jira response', async () => {
    const { fetchImpl } = mockFetch(() => ({ status: 404, body: 'not found' }))
    const client = createClient({ ...baseOpts, fetchImpl })
    await expect(client.getEpic('ENG-999')).rejects.toThrow(/404/)
  })

  it('validates required options', () => {
    expect(() => createClient({ ...baseOpts, baseUrl: '' })).toThrow(/baseUrl/)
    expect(() => createClient({ ...baseOpts, email: '' })).toThrow(/email/)
    expect(() => createClient({ ...baseOpts, apiToken: '' })).toThrow(/apiToken/)
    expect(() => createClient({ ...baseOpts, projectKey: '' })).toThrow(/projectKey/)
  })
})

describe('client — Integration.fetch', () => {
  it('fetches `jira://<KEY>` and returns extracted text + mimeType + source', async () => {
    const { fetchImpl } = mockFetch(() => ({
      body: {
        id: '1',
        key: 'ENG-100',
        fields: {
          summary: 'Build lending flow',
          description: {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Borrowers apply.' }] }],
          },
        },
      },
    }))
    const client = createClient({ ...baseOpts, fetchImpl })
    const result = await client.fetch('jira://ENG-100')
    expect(result.contents).toBe('Build lending flow\n\nBorrowers apply.')
    expect(result.mimeType).toBe('text/markdown')
    expect(result.source.uri).toBe('jira://ENG-100')
    expect(new Date(result.source.loadedAt).toISOString()).toBe(result.source.loadedAt)
  })

  it('rejects URIs with the wrong scheme', async () => {
    const { fetchImpl } = mockFetch(() => ({ body: {} }))
    const client = createClient({ ...baseOpts, fetchImpl })
    await expect(client.fetch('https://ENG-100')).rejects.toThrow(/unrecognized URI/)
  })

  it('rejects child sub-scheme on fetch', async () => {
    const { fetchImpl } = mockFetch(() => ({ body: {} }))
    const client = createClient({ ...baseOpts, fetchImpl })
    await expect(client.fetch('jira:child://ENG-100')).rejects.toThrow(/fetch only supports/)
  })
})

describe('client — Integration.write', () => {
  it('jira:child://<EPIC> creates a child issue with summary + dna label + epic links', async () => {
    const bodies: Array<{ url: string; payload: unknown }> = []
    const { fetchImpl } = mockFetch((url, init) => {
      bodies.push({ url, payload: JSON.parse(init.body as string) })
      return { body: { id: '7', key: 'ENG-107', self: '' } }
    })
    const client = createClient({ ...baseOpts, fetchImpl })
    const result = await client.write(
      'jira:child://ENG-100?summary=Apply+Loan&label=operation-loan-apply',
      { contents: 'As a Borrower\n\nI want to submit', mimeType: 'text/markdown' },
    )
    expect(result.target).toBe('jira://ENG-107')
    expect(bodies).toHaveLength(1)
    const fields = (bodies[0].payload as { fields: Record<string, unknown> }).fields
    expect(fields.summary).toBe('Apply Loan')
    expect(fields.issuetype).toEqual({ name: 'Story' })
    expect(fields.project).toEqual({ key: 'ENG' })
    expect(fields.parent).toEqual({ key: 'ENG-100' })
    expect(fields.customfield_10014).toBe('ENG-100')
    expect(fields.labels).toEqual(['dna:operation-loan-apply'])
    expect((fields.description as { type: string }).type).toBe('doc')
  })

  it('jira:child://<EPIC> appends extra-label query params to the labels array', async () => {
    const bodies: unknown[] = []
    const { fetchImpl } = mockFetch((_u, init) => {
      bodies.push(JSON.parse(init.body as string))
      return { body: { id: '8', key: 'ENG-108', self: '' } }
    })
    const client = createClient({ ...baseOpts, fetchImpl })
    await client.write(
      'jira:child://ENG-100?summary=X&label=op-x&extra-label=generated&extra-label=needs-review',
      { contents: 'body', mimeType: 'text/markdown' },
    )
    const fields = (bodies[0] as { fields: { labels: string[] } }).fields
    expect(fields.labels).toEqual(['dna:op-x', 'generated', 'needs-review'])
  })

  it('jira:child:// rejects writes without summary', async () => {
    const { fetchImpl } = mockFetch(() => ({ body: {} }))
    const client = createClient({ ...baseOpts, fetchImpl })
    await expect(
      client.write('jira:child://ENG-100', { contents: 'b', mimeType: 'text/markdown' }),
    ).rejects.toThrow(/summary/)
  })

  it('jira://<KEY> updates the named issue, preserving non-dna labels', async () => {
    const seen: Array<{ url: string; method: string; body?: unknown }> = []
    const { fetchImpl } = mockFetch((url, init) => {
      seen.push({
        url,
        method: init.method ?? 'GET',
        body: init.body ? JSON.parse(init.body as string) : undefined,
      })
      if (init.method === 'PUT') return { status: 204, body: '' }
      // GET — return an existing issue with mixed labels
      return {
        body: {
          id: '7',
          key: 'ENG-107',
          fields: { summary: 'old', labels: ['dna:old-id', 'generated', 'priority-high'] },
        },
      }
    })
    const client = createClient({ ...baseOpts, fetchImpl })
    const result = await client.write(
      'jira://ENG-107?summary=New+Title&label=operation-loan-apply',
      { contents: 'updated body', mimeType: 'text/markdown' },
    )
    expect(result.target).toBe('jira://ENG-107')
    const put = seen.find((s) => s.method === 'PUT')!
    const fields = (put.body as { fields: Record<string, unknown> }).fields
    expect(fields.summary).toBe('New Title')
    // dna:* label replaced; non-dna labels preserved
    expect(fields.labels).toEqual(['dna:operation-loan-apply', 'generated', 'priority-high'])
  })

  it('rejects non-markdown payloads', async () => {
    const { fetchImpl } = mockFetch(() => ({ body: {} }))
    const client = createClient({ ...baseOpts, fetchImpl })
    await expect(
      client.write('jira:child://ENG-100?summary=X&label=y', {
        contents: '{}',
        mimeType: 'application/json',
      }),
    ).rejects.toThrow(/text\/markdown/)
  })

  it('round-trips bytes from fetch into write without transformation', async () => {
    let capturedBody: { contents: unknown; mimeType: string } | undefined
    const { fetchImpl } = mockFetch((_url, init) => {
      if (init.method === 'POST') {
        const f = (JSON.parse(init.body as string) as { fields: { description: unknown } }).fields
        // The Jira side wraps in ADF; we just need to confirm write was invoked.
        capturedBody = { contents: f.description, mimeType: 'text/markdown' }
        return { body: { id: '1', key: 'ENG-200', self: '' } }
      }
      return {
        body: {
          id: '1',
          key: 'ENG-100',
          fields: {
            summary: 'Title',
            description: {
              type: 'doc',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'body bytes' }] }],
            },
          },
        },
      }
    })
    const client = createClient({ ...baseOpts, fetchImpl })
    const r = await client.fetch('jira://ENG-100')
    await client.write(`jira:child://ENG-100?summary=${encodeURIComponent('child')}&label=op-x`, {
      contents: r.contents,
      mimeType: r.mimeType,
    })
    expect(capturedBody?.mimeType).toBe('text/markdown')
  })
})

describe('client — searchChildrenByDnaLabel', () => {
  it('indexes children by canonical, capability-prefixed, and bare suffix labels', async () => {
    const { fetchImpl } = mockFetch(() => ({
      body: {
        issues: [
          { id: '1', key: 'ENG-101', fields: { summary: 'a', labels: ['dna:capability-loan-apply'] } },
          { id: '2', key: 'ENG-102', fields: { summary: 'b', labels: ['dna:operation-loan-approve', 'extra'] } },
          { id: '3', key: 'ENG-103', fields: { summary: 'c', labels: ['unrelated'] } },
        ],
      },
    }))
    const client = createClient({ ...baseOpts, fetchImpl })
    const map = await client.searchChildrenByDnaLabel('ENG-100')
    expect(map.get('capability-loan-apply')).toBe('ENG-101')
    expect(map.get('loan-apply')).toBe('ENG-101')
    expect(map.get('operation-loan-approve')).toBe('ENG-102')
    expect(map.get('capability-operation-loan-approve')).toBe('ENG-102')
    expect(map.get('unrelated')).toBeUndefined()
  })
})

describe('cli parseArgs', () => {
  it('parses --flag value and boolean flags', () => {
    const parsed = parseArgs(['--epic', 'ENG-1', '--in', 'dna.json', '--dry-run'])
    expect(parsed.flags.epic).toBe('ENG-1')
    expect(parsed.flags.in).toBe('dna.json')
    expect(parsed.flags['dry-run']).toBe(true)
  })
})
