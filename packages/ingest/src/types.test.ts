import type { Integration, WritePayload, WriteResult } from './types'

describe('Integration contract', () => {
  it('accepts a read-only integration with no write method', async () => {
    const readOnly: Integration = {
      async fetch(uri) {
        return {
          contents: 'hi',
          mimeType: 'text/plain',
          source: { uri, loadedAt: '2026-01-01T00:00:00.000Z' },
        }
      },
    }
    expect(typeof readOnly.fetch).toBe('function')
    expect(readOnly.write).toBeUndefined()
    // Optional-chaining call is a no-op on read-only integrations.
    const writeResult = await readOnly.write?.('ignored', { contents: 'x', mimeType: 'text/plain' })
    expect(writeResult).toBeUndefined()
  })

  it('accepts a bidirectional integration with both fetch and write', async () => {
    const bidi: Integration = {
      async fetch(uri) {
        return {
          contents: Buffer.from('payload'),
          mimeType: 'application/octet-stream',
          source: { uri, loadedAt: new Date().toISOString() },
        }
      },
      async write(target, payload) {
        const result: WriteResult = {
          target,
          meta: { mimeType: payload.mimeType, bytes: payload.contents.length },
        }
        return result
      },
    }

    const r = await bidi.fetch('demo://thing')
    const payload: WritePayload = { contents: r.contents, mimeType: r.mimeType }
    const out = await bidi.write!('demo://thing', payload)
    expect(out.target).toBe('demo://thing')
    expect(out.meta?.mimeType).toBe('application/octet-stream')
  })

  it('round-trips bytes from fetch into write without transformation', async () => {
    const captured: WritePayload[] = []
    const i: Integration = {
      async fetch(uri) {
        return {
          contents: 'hello world',
          mimeType: 'text/markdown',
          source: { uri, loadedAt: '2026-01-01T00:00:00.000Z' },
        }
      },
      async write(target, payload) {
        captured.push(payload)
        return { target }
      },
    }

    const r = await i.fetch('x://y')
    await i.write!(r.source.uri, { contents: r.contents, mimeType: r.mimeType })
    expect(captured[0].contents).toBe('hello world')
    expect(captured[0].mimeType).toBe('text/markdown')
  })
})
