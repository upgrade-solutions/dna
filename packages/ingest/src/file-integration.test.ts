import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { fileIntegration } from './file-integration'

describe('fileIntegration', () => {
  let tmpDir: string

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dna-ingest-test-'))
  })

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('reads a file:// URI and returns the contents with an inferred MIME type', async () => {
    const file = path.join(tmpDir, 'sop.md')
    fs.writeFileSync(file, '# SOP\n\nContents here.', 'utf-8')
    const uri = `file://${file}`
    const result = await fileIntegration().fetch(uri)
    expect(result.contents).toContain('# SOP')
    expect(result.mimeType).toBe('text/markdown')
    expect(result.source.uri).toBe(uri)
    // loadedAt round-trips through Date
    expect(new Date(result.source.loadedAt).toISOString()).toBe(result.source.loadedAt)
  })

  it('reads a bare filesystem path identical to file://', async () => {
    const file = path.join(tmpDir, 'plain.txt')
    fs.writeFileSync(file, 'hi', 'utf-8')
    const result = await fileIntegration().fetch(file)
    expect(result.contents).toBe('hi')
    expect(result.mimeType).toBe('text/plain')
  })

  it('returns Buffer contents for non-text MIME types', async () => {
    const file = path.join(tmpDir, 'pixel.png')
    fs.writeFileSync(file, Buffer.from([0x89, 0x50, 0x4e, 0x47]))
    const result = await fileIntegration().fetch(file)
    expect(Buffer.isBuffer(result.contents)).toBe(true)
    expect(result.mimeType).toBe('image/png')
  })

  it('falls back to application/octet-stream for unknown extensions', async () => {
    const file = path.join(tmpDir, 'mystery.xyz')
    fs.writeFileSync(file, Buffer.from([1, 2, 3]))
    const result = await fileIntegration().fetch(file)
    expect(result.mimeType).toBe('application/octet-stream')
  })
})
