import googleDriveIntegrationDefault, {
  googleDriveIntegration,
  NotImplementedError,
} from './index'

describe('googleDriveIntegration (stub)', () => {
  describe('Integration contract shape', () => {
    it('the named factory returns an object with an async fetch method', () => {
      const integration = googleDriveIntegration()
      expect(typeof integration.fetch).toBe('function')
    })

    it('the default export is the same factory as the named export', () => {
      expect(googleDriveIntegrationDefault).toBe(googleDriveIntegration)
    })
  })

  describe('mocked fetches', () => {
    it('returns the mock contents wrapped in the Integration contract shape', async () => {
      const integration = googleDriveIntegration({
        mock: { 'gdrive://abc': { contents: 'hello', mimeType: 'text/plain' } },
      })
      const result = await integration.fetch('gdrive://abc')
      expect(result.contents).toBe('hello')
      expect(result.mimeType).toBe('text/plain')
      expect(result.source.uri).toBe('gdrive://abc')
    })

    it('sets loadedAt at fetch time, not factory construction time', async () => {
      const before = Date.now()
      const integration = googleDriveIntegration({
        mock: { 'gdrive://x': { contents: 'x', mimeType: 'text/plain' } },
      })
      // Wait long enough that fetch-time clearly differs from construction-time
      // even on coarse clocks. 5ms is more than enough for any reasonable host.
      await new Promise((r) => setTimeout(r, 5))
      const result = await integration.fetch('gdrive://x')
      const loadedMs = new Date(result.source.loadedAt).getTime()
      expect(loadedMs).toBeGreaterThanOrEqual(before)
      expect(Date.now() - loadedMs).toBeLessThan(1000)
    })

    it('produces an ISO 8601 loadedAt that round-trips through Date', async () => {
      const integration = googleDriveIntegration({
        mock: { 'gdrive://x': { contents: '', mimeType: 'text/plain' } },
      })
      const result = await integration.fetch('gdrive://x')
      expect(new Date(result.source.loadedAt).toISOString()).toBe(result.source.loadedAt)
    })
  })

  describe('unmocked fetches', () => {
    it('throws NotImplementedError when the factory has no mock', async () => {
      const integration = googleDriveIntegration()
      await expect(integration.fetch('gdrive://anything')).rejects.toMatchObject({
        name: 'NotImplementedError',
      })
    })

    it('throws NotImplementedError when the URI is absent from the mock map', async () => {
      const integration = googleDriveIntegration({
        mock: { 'gdrive://abc': { contents: 'x', mimeType: 'text/plain' } },
      })
      await expect(integration.fetch('gdrive://other')).rejects.toMatchObject({
        name: 'NotImplementedError',
      })
    })

    it('error message references both Google Drive and the mock parameter', async () => {
      const integration = googleDriveIntegration()
      try {
        await integration.fetch('gdrive://x')
        fail('expected throw')
      } catch (err) {
        expect(err).toBeInstanceOf(NotImplementedError)
        const message = (err as Error).message
        expect(message).toMatch(/Google Drive/i)
        expect(message).toMatch(/mock/i)
      }
    })
  })
})
