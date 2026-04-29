/**
 * Outbound API client for the external system.
 *
 * Uses global fetch (Node 18+) — no SDK. Add provider-specific logic here:
 * auth flow, pagination, rate-limit handling, retry policy, API versioning.
 *
 * The client exposes two high-level helpers on top of the raw HTTP methods:
 *   - pullDna() — fetch everything and convert to DNA
 *   - pushDna() — convert DNA and push each record
 *
 * Keep HTTP concerns here; keep semantic translation in mapping.ts.
 */

import { dnaToItems, itemsToDna } from './mapping'
import {
  Client,
  ClientOptions,
  DnaInput,
  ExternalItem,
  ExternalListResponse,
} from './types'

const DEFAULT_USER_AGENT = '@dna-codes/dna-integration-example (template)'

export function createClient(options: ClientOptions): Client {
  if (!options.baseUrl) throw new Error('integration-example: options.baseUrl is required.')
  if (!options.apiToken) throw new Error('integration-example: options.apiToken is required.')

  const fetchImpl = options.fetchImpl ?? fetch
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT
  const base = options.baseUrl.replace(/\/$/, '')

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetchImpl(`${base}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        'user-agent': userAgent,
        authorization: `Bearer ${options.apiToken}`,
        ...(init.headers ?? {}),
      },
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`integration-example: ${init.method ?? 'GET'} ${path} → ${res.status} ${body}`)
    }
    return (await res.json()) as T
  }

  async function listItems({ cursor }: { cursor?: string } = {}): Promise<ExternalListResponse> {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
    return request<ExternalListResponse>(`/items${query}`)
  }

  async function createItem(item: Omit<ExternalItem, 'id'>): Promise<ExternalItem> {
    return request<ExternalItem>('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    })
  }

  async function pullDna(): Promise<DnaInput> {
    const all: ExternalItem[] = []
    let cursor: string | undefined
    do {
      const page = await listItems({ cursor })
      all.push(...page.items)
      cursor = page.nextCursor
    } while (cursor)

    const domain = deriveDomain(options.baseUrl)
    return itemsToDna(all, domain)
  }

  async function pushDna(dna: DnaInput): Promise<{ created: number }> {
    const items = dnaToItems(dna)
    let created = 0
    for (const item of items) {
      await createItem(item)
      created++
    }
    return { created }
  }

  return { listItems, createItem, pullDna, pushDna }
}

function deriveDomain(baseUrl: string): string {
  try {
    const host = new URL(baseUrl).host
    return host.replace(/[^a-z0-9]+/gi, '.').toLowerCase()
  } catch {
    return 'external'
  }
}
