import { adapterFor, integrationFor, schemeOf } from './dispatch'
import type { Integration, InputAdapter } from './types'

describe('schemeOf', () => {
  it('extracts the scheme from a URI', () => {
    expect(schemeOf('gdrive://abc')).toBe('gdrive')
    expect(schemeOf('file:///tmp/sop.md')).toBe('file')
    expect(schemeOf('NOTION://Page')).toBe('notion')
  })

  it('returns null for a bare path', () => {
    expect(schemeOf('/tmp/sop.md')).toBeNull()
    expect(schemeOf('./relative/path')).toBeNull()
  })
})

describe('integrationFor', () => {
  const builtIn: Integration = { fetch: async () => ({ contents: '', mimeType: '', source: { uri: '', loadedAt: '' } }) }

  it('returns the built-in for file:// URIs', () => {
    const result = integrationFor('file:///tmp/sop.md', {}, builtIn)
    expect(result).toBe(builtIn)
  })

  it('returns the built-in for bare paths', () => {
    const result = integrationFor('/tmp/sop.md', {}, builtIn)
    expect(result).toBe(builtIn)
  })

  it('routes other schemes to the integrations map', () => {
    const drive: Integration = { fetch: jest.fn() } as unknown as Integration
    const result = integrationFor('gdrive://abc', { gdrive: drive }, builtIn)
    expect(result).toBe(drive)
  })

  it('returns null when no integration is registered for the scheme', () => {
    const result = integrationFor('notion://abc', {}, builtIn)
    expect(result).toBeNull()
  })
})

describe('adapterFor', () => {
  const text: InputAdapter = jest.fn() as unknown as InputAdapter
  const markdown: InputAdapter = jest.fn() as unknown as InputAdapter
  const wildcard: InputAdapter = jest.fn() as unknown as InputAdapter

  it('matches an exact MIME key', () => {
    const inputs = { 'text/markdown': markdown }
    const result = adapterFor('text/markdown', inputs)
    expect(result?.adapter).toBe(markdown)
  })

  it('matches a wildcard MIME key', () => {
    const inputs = { 'text/*': text }
    const result = adapterFor('text/markdown', inputs)
    expect(result?.adapter).toBe(text)
  })

  it('prefers a specific match over a wildcard', () => {
    const inputs = { 'text/markdown': markdown, 'text/*': text }
    const result = adapterFor('text/markdown', inputs)
    expect(result?.adapter).toBe(markdown)
  })

  it('falls back to a wildcard when no exact match exists', () => {
    const inputs = { 'text/markdown': markdown, 'text/*': text }
    const result = adapterFor('text/plain', inputs)
    expect(result?.adapter).toBe(text)
  })

  it('matches */* against any MIME', () => {
    const inputs = { '*/*': wildcard }
    expect(adapterFor('application/zip', inputs)?.adapter).toBe(wildcard)
  })

  it('returns null when no key matches', () => {
    const inputs = { 'text/*': text }
    expect(adapterFor('application/zip', inputs)).toBeNull()
  })
})
