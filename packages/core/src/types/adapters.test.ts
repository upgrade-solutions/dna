import { DEFAULT_STYLES, type ParseResult, type Style, type StyleMap, type Unit } from '../index'

describe('adapter contract types', () => {
  describe('ParseResult', () => {
    it('accepts a fully populated parse result', () => {
      const r: ParseResult = {
        operational: { domain: { name: 'd' } },
        product: { resources: [] },
        technical: { cells: [] },
        missingLayers: [],
        raw: '{"operational":{}}',
      }
      expect(r.missingLayers).toEqual([])
    })

    it('accepts a partial parse with missingLayers populated', () => {
      const r: ParseResult = {
        operational: { domain: { name: 'd' } },
        missingLayers: ['product', 'technical'],
        raw: '...',
      }
      expect(r.missingLayers).toContain('product')
      expect(r.missingLayers).toContain('technical')
    })
  })

  describe('Style and Unit unions', () => {
    it('accepts every documented Style member', () => {
      const styles: Style[] = ['user-story', 'gherkin', 'product-dna']
      expect(styles).toHaveLength(3)
    })

    it('accepts every documented Unit member', () => {
      const units: Unit[] = ['operation', 'resource', 'process']
      expect(units).toHaveLength(3)
    })

    it('StyleMap is keyed by Unit', () => {
      const m: StyleMap = { operation: 'user-story', resource: 'product-dna' }
      expect(m.operation).toBe('user-story')
    })
  })

  describe('DEFAULT_STYLES', () => {
    it('defaults operation → user-story', () => {
      expect(DEFAULT_STYLES.operation).toBe('user-story')
    })

    it('leaves resource and process unset by default', () => {
      expect(DEFAULT_STYLES.resource).toBeUndefined()
      expect(DEFAULT_STYLES.process).toBeUndefined()
    })
  })
})
