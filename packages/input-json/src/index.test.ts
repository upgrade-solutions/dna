import { parse } from './index'

const bookSample = {
  id: 'book-1',
  title: 'The Hobbit',
  status: 'active',
  published_at: '1937-09-21T00:00:00Z',
  rating: 4.9,
  in_stock: true,
  tags: ['fantasy', 'classic'],
  author: {
    id: 'author-1',
    name: 'J. R. R. Tolkien',
  },
  reviews: [
    { rating: 5, comment: 'Brilliant.', reviewer: 'Alice' },
    { rating: 4, comment: 'Charming.', reviewer: 'Bob' },
  ],
}

describe('@dna-codes/input-json', () => {
  describe('root noun', () => {
    it('names the root noun from options.name', () => {
      const { operational } = parse(bookSample, { name: 'Book' })
      const root = operational.domain.nouns.find((n) => n.name === 'Book')
      expect(root).toBeDefined()
    })

    it('infers scalar attribute types from values', () => {
      const { operational } = parse(bookSample, { name: 'Book' })
      const book = operational.domain.nouns.find((n) => n.name === 'Book')!
      const byName = Object.fromEntries(book.attributes.map((a) => [a.name, a]))
      expect(byName.id.type).toBe('string')
      expect(byName.rating.type).toBe('number')
      expect(byName.in_stock.type).toBe('boolean')
      expect(byName.published_at.type).toBe('datetime')
    })

    it('detects date-only strings', () => {
      const { operational } = parse({ due_date: '2026-12-31' }, { name: 'Thing' })
      const attr = operational.domain.nouns[0].attributes.find((a) => a.name === 'due_date')
      expect(attr?.type).toBe('date')
    })

    it('represents arrays of scalars as array-typed attributes', () => {
      const { operational } = parse(bookSample, { name: 'Book' })
      const tags = operational.domain.nouns.find((n) => n.name === 'Book')!
        .attributes.find((a) => a.name === 'tags')
      expect(tags?.type).toBe('array')
    })
  })

  describe('nested objects → child noun + one-to-one relationship', () => {
    it('extracts a child Noun from a nested object', () => {
      const { operational } = parse(bookSample, { name: 'Book' })
      const author = operational.domain.nouns.find((n) => n.name === 'Author')
      expect(author).toBeDefined()
      expect(author!.attributes.map((a) => a.name).sort()).toEqual(['id', 'name'])
    })

    it('adds a reference attribute on the parent noun', () => {
      const { operational } = parse(bookSample, { name: 'Book' })
      const book = operational.domain.nouns.find((n) => n.name === 'Book')!
      const authorAttr = book.attributes.find((a) => a.name === 'author')
      expect(authorAttr).toEqual({ name: 'author', type: 'reference', noun: 'Author' })
    })

    it('emits a one-to-one relationship', () => {
      const { operational } = parse(bookSample, { name: 'Book' })
      const rel = operational.relationships?.find((r) => r.name === 'Book.author')
      expect(rel).toEqual({
        name: 'Book.author',
        from: 'Book',
        to: 'Author',
        attribute: 'author',
        cardinality: 'one-to-one',
      })
    })
  })

  describe('arrays of objects → child noun + one-to-many relationship', () => {
    it('singularizes array keys to derive the child noun name', () => {
      const { operational } = parse(bookSample, { name: 'Book' })
      const review = operational.domain.nouns.find((n) => n.name === 'Review')
      expect(review).toBeDefined()
      expect(review!.attributes.map((a) => a.name).sort()).toEqual([
        'comment',
        'rating',
        'reviewer',
      ])
    })

    it('emits a one-to-many relationship', () => {
      const { operational } = parse(bookSample, { name: 'Book' })
      const rel = operational.relationships?.find((r) => r.name === 'Book.reviews')
      expect(rel?.cardinality).toBe('one-to-many')
      expect(rel?.from).toBe('Book')
      expect(rel?.to).toBe('Review')
    })

    it('merges attribute keys across all array items', () => {
      const { operational } = parse(
        {
          id: 'x',
          items: [
            { a: 1, b: 'x' },
            { a: 2, c: true },
          ],
        },
        { name: 'Container' },
      )
      const item = operational.domain.nouns.find((n) => n.name === 'Item')!
      expect(item.attributes.map((a) => a.name).sort()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('singularization', () => {
    it('handles -ies → -y', () => {
      const { operational } = parse(
        { id: 'x', categories: [{ name: 'fiction' }] },
        { name: 'Book' },
      )
      expect(operational.domain.nouns.map((n) => n.name).sort()).toEqual(['Book', 'Category'])
    })

    it('does not strip -ss', () => {
      const { operational } = parse({ id: 'x', address: { street: '1 Main' } }, { name: 'Order' })
      expect(operational.domain.nouns.map((n) => n.name).sort()).toEqual(['Address', 'Order'])
    })

    it('honors nounNameFromKey override', () => {
      const { operational } = parse(bookSample, {
        name: 'Book',
        nounNameFromKey: (k) => (k === 'author' ? 'Person' : k),
      })
      expect(operational.domain.nouns.find((n) => n.name === 'Person')).toBeDefined()
    })
  })

  describe('inputs', () => {
    it('accepts a top-level array and merges items for the root noun', () => {
      const { operational } = parse(
        [
          { id: 1, title: 'a' },
          { id: 2, title: 'b', subtitle: 'bb' },
        ],
        { name: 'Book' },
      )
      const book = operational.domain.nouns.find((n) => n.name === 'Book')!
      expect(book.attributes.map((a) => a.name).sort()).toEqual(['id', 'subtitle', 'title'])
    })

    it('rejects non-object/non-array input', () => {
      expect(() => parse('nope' as unknown, { name: 'X' })).toThrow(/object or array/)
    })
  })

  describe('domain', () => {
    it('defaults the domain name to a lowercased root noun name', () => {
      const { operational } = parse(bookSample, { name: 'Book' })
      expect(operational.domain.name).toBe('book')
    })

    it('honors an explicit domain option', () => {
      const { operational } = parse(bookSample, { name: 'Book', domain: 'shop.books' })
      expect(operational.domain.name).toBe('shop.books')
    })
  })
})
