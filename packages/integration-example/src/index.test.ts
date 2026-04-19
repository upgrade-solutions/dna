import { createHmac } from 'crypto'

import { createClient } from './client'
import { dnaToItems, itemsToDna } from './mapping'
import { parseWebhook, verifySignature, WebhookError } from './webhook'

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

describe('mapping', () => {
  it('maps external items to DNA Resources with PascalCase names', () => {
    const dna = itemsToDna([{ id: 'i1', title: 'loan application', tags: ['a', 'b'] }], 'acme.ops')
    const [resource] = dna.operational!.domain.resources!
    expect(resource.name).toBe('LoanApplication')
    expect(resource.metadata?.externalId).toBe('i1')
    expect(resource.metadata?.tags).toEqual(['a', 'b'])
  })

  it('round-trips Resources through dnaToItems', () => {
    const dna = itemsToDna([{ id: 'i1', title: 'Loan', description: 'x' }], 'acme.ops')
    const [out] = dnaToItems(dna)
    expect(out.title).toBe('Loan')
    expect(out.description).toBe('x')
  })
})

describe('client', () => {
  it('sends Bearer auth and paginates via nextCursor', async () => {
    const { fetchImpl, calls } = mockFetch((url) => {
      if (url.endsWith('/items')) {
        return { body: { items: [{ id: 'a', title: 'First' }], nextCursor: 'c2' } }
      }
      return { body: { items: [{ id: 'b', title: 'Second' }] } }
    })

    const client = createClient({ baseUrl: 'https://api.example.com/', apiToken: 'tok', fetchImpl })
    const dna = await client.pullDna()

    expect(calls).toHaveLength(2)
    expect((calls[0].init.headers as Record<string, string>).authorization).toBe('Bearer tok')
    expect(calls[1].url).toContain('cursor=c2')
    expect(dna.operational?.domain.resources?.map((r) => r.name)).toEqual(['First', 'Second'])
  })

  it('pushDna creates an item per Resource', async () => {
    const { fetchImpl, calls } = mockFetch((_url, init) => {
      const body = JSON.parse(init.body as string)
      return { body: { id: 'new', ...body } }
    })

    const client = createClient({ baseUrl: 'https://api.example.com', apiToken: 'tok', fetchImpl })
    const { created } = await client.pushDna({
      operational: {
        domain: { name: 'ops', resources: [{ name: 'Alpha' }, { name: 'Beta' }] },
      },
    })

    expect(created).toBe(2)
    expect(calls.every((c) => c.init.method === 'POST')).toBe(true)
  })

  it('throws on non-2xx responses', async () => {
    const { fetchImpl } = mockFetch(() => ({ status: 500, body: 'boom' }))
    const client = createClient({ baseUrl: 'https://api.example.com', apiToken: 't', fetchImpl })
    await expect(client.listItems()).rejects.toThrow(/500/)
  })

  it('throws when baseUrl or apiToken is missing', () => {
    expect(() => createClient({ baseUrl: '', apiToken: 't' } as never)).toThrow(/baseUrl/)
    expect(() => createClient({ baseUrl: 'x', apiToken: '' } as never)).toThrow(/apiToken/)
  })
})

describe('webhook', () => {
  const secret = 'shh'
  const body = JSON.stringify({
    type: 'item.created',
    item: { id: 'i1', title: 'Hi' },
    occurredAt: '2026-04-18T00:00:00Z',
  })
  const sig = createHmac('sha256', secret).update(body, 'utf8').digest('hex')

  it('verifies a correct signature', () => {
    expect(verifySignature(body, sig, secret)).toBe(true)
    expect(verifySignature(body, `sha256=${sig}`, secret)).toBe(true)
  })

  it('rejects a wrong signature', () => {
    expect(verifySignature(body, 'deadbeef', secret)).toBe(false)
    expect(verifySignature(body, undefined, secret)).toBe(false)
  })

  it('parses a valid webhook', () => {
    const event = parseWebhook(body, { 'x-example-signature': sig }, { secret })
    expect(event.type).toBe('item.created')
    expect(event.item.id).toBe('i1')
  })

  it('throws 401 on bad signature', () => {
    expect(() => parseWebhook(body, { 'x-example-signature': 'bad' }, { secret })).toThrow(WebhookError)
  })

  it('throws 400 on malformed body', () => {
    const badBody = 'not-json'
    const badSig = createHmac('sha256', secret).update(badBody, 'utf8').digest('hex')
    try {
      parseWebhook(badBody, { 'x-example-signature': badSig }, { secret })
      fail('expected throw')
    } catch (err) {
      expect(err).toBeInstanceOf(WebhookError)
      expect((err as WebhookError).status).toBe(400)
    }
  })
})
