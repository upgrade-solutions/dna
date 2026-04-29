import { parse, parseText } from './index'

const sample = {
  entities: [
    {
      name: 'loan',
      fields: [
        { name: 'amount', type: 'number', required: true },
        { name: 'status', type: 'string' },
      ],
    },
    {
      name: 'borrower',
      fields: [{ name: 'email', type: 'string', required: true }],
    },
  ],
  actions: [
    { entity: 'loan', action: 'Apply' },
    { entity: 'loan', action: 'approve' },
  ],
}

describe('@dna-codes/dna-input-example — parse (deterministic)', () => {
  it('PascalCases entity names into Resources', () => {
    const { operational } = parse(sample, { domain: 'acme.finance.lending' })
    expect(operational.domain.resources.map((r) => r.name)).toEqual(['Loan', 'Borrower'])
  })

  it('preserves attribute types and required flags', () => {
    const { operational } = parse(sample, { domain: 'acme.finance.lending' })
    const loan = operational.domain.resources.find((r) => r.name === 'Loan')
    expect(loan?.attributes).toEqual([
      { name: 'amount', type: 'number', required: true },
      { name: 'status', type: 'string' },
    ])
  })

  it('emits capabilities and attaches actions to the matching Resource', () => {
    const { operational } = parse(sample, { domain: 'acme.finance.lending' })
    expect(operational.capabilities).toEqual([
      { resource: 'Loan', action: 'Apply', name: 'Loan.Apply' },
      { resource: 'Loan', action: 'Approve', name: 'Loan.Approve' },
    ])
    const loan = operational.domain.resources.find((r) => r.name === 'Loan')
    expect(loan?.actions).toEqual([{ name: 'Apply' }, { name: 'Approve' }])
  })

  it('uses the domain leaf as name and full path as path', () => {
    const { operational } = parse(sample, { domain: 'acme.finance.lending' })
    expect(operational.domain.name).toBe('lending')
    expect(operational.domain.path).toBe('acme.finance.lending')
  })

  it('throws when data is malformed', () => {
    expect(() => parse({} as never, { domain: 'x' })).toThrow(/entities/)
  })

  it('throws when options.domain is missing', () => {
    expect(() => parse(sample, {} as never)).toThrow(/domain/)
  })
})

// ---------------------------------------------------------------------------
// Probabilistic tests — mock fetch to assert request shape + response parse.
// ---------------------------------------------------------------------------

type FetchCall = { url: string; init: RequestInit }

function mockFetch(body: unknown, status = 200): { fetchImpl: typeof fetch; calls: FetchCall[] } {
  const calls: FetchCall[] = []
  const fetchImpl = (async (url: unknown, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} })
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () => JSON.stringify(body),
    } as Response
  }) as typeof fetch
  return { fetchImpl, calls }
}

const openAiBody = (content: string) => ({ choices: [{ message: { content } }] })

describe('@dna-codes/dna-input-example — parseText (probabilistic)', () => {
  it('sends an OpenAI chat completion and parses the returned JSON', async () => {
    const dna = { operational: { domain: { name: 'x', path: 'x', resources: [] } } }
    const { fetchImpl, calls } = mockFetch(openAiBody(JSON.stringify(dna)))

    const result = await parseText('A lending business.', {
      provider: 'openai',
      apiKey: 'sk-test',
      fetchImpl,
    })

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('https://api.openai.com/v1/chat/completions')
    const headers = calls[0].init.headers as Record<string, string>
    expect(headers.authorization).toBe('Bearer sk-test')
    expect(result.operational?.domain.name).toBe('x')
    expect(result.raw).toBe(JSON.stringify(dna))
  })

  it('throws on empty text', async () => {
    await expect(
      parseText('', { provider: 'openai', apiKey: 'sk-test', fetchImpl: mockFetch({}).fetchImpl }),
    ).rejects.toThrow(/non-empty string/)
  })

  it('throws on missing apiKey', async () => {
    await expect(
      parseText('hi', { provider: 'openai', apiKey: '', fetchImpl: mockFetch({}).fetchImpl }),
    ).rejects.toThrow(/apiKey/)
  })
})
