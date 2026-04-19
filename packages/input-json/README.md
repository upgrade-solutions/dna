# `@dna-codes/input-json`

Infer a DNA operational slice from a **plain JSON data sample** — not JSON Schema. Given a record (or an array of records), it produces Resources, Attributes, and Relationships by walking the structure. Zero runtime dependencies.

Useful for bootstrapping DNA from:
- A sample API response
- An exported record from a database
- A config blob someone pasted at you

## Install

```bash
npm install @dna-codes/input-json
```

## Usage

```ts
import { parse } from '@dna-codes/input-json'

const sample = {
  id: 'book-1',
  title: 'The Hobbit',
  published_at: '1937-09-21T00:00:00Z',
  rating: 4.9,
  in_stock: true,
  tags: ['fantasy', 'classic'],
  author: { id: 'author-1', name: 'Tolkien' },
  reviews: [
    { rating: 5, comment: 'Brilliant.' },
    { rating: 4, comment: 'Charming.' },
  ],
}

const { operational } = parse(sample, { name: 'Book' })
// → {
//     domain: { name: 'book', resources: [Book, Author, Review] },
//     relationships: [
//       { name: 'Book.author', from: 'Book', to: 'Author', attribute: 'author', cardinality: 'one-to-one' },
//       { name: 'Book.reviews', from: 'Book', to: 'Review', attribute: 'reviews', cardinality: 'one-to-many' },
//     ]
//   }
```

## API

### `parse(data, options)`

| Option | Default | Meaning |
|--------|---------|---------|
| `name` (required) | — | Name for the root Resource. Input JSON doesn't name itself. |
| `domain` | lowercased `name` | Name of the wrapping domain in the result. |
| `resourceNameFromKey` | PascalCase + singularize | Maps a property key (e.g. `authors`) to the Resource name (`Author`). |

## Inference rules

| JSON shape | DNA |
|------------|-----|
| scalar value (string, number, boolean, date-ish string) | Attribute with inferred type |
| ISO 8601 date string (`2026-12-31`) | Attribute with type `date` |
| ISO 8601 datetime string (`2026-12-31T00:00:00Z`) | Attribute with type `datetime` |
| array of scalars | dropped (no faithful single-Attribute representation) |
| nested object | child Resource + **one-to-one** Relationship |
| array of objects | child Resource + **one-to-many** Relationship (schema merged across items) |

Default key-to-resource naming:
- `author` → `Author`
- `reviews` → `Review`
- `categories` → `Category`
- `address` → `Address` (doesn't strip `-ss`)
- Override via `resourceNameFromKey` if you need control.

## Top-level arrays

Pass an array and the items get shallow-merged into a single sample for the root Resource — useful when you have a list of records with partial fields:

```ts
parse([{ id: 1, title: 'a' }, { id: 2, title: 'b', subtitle: 'bb' }], { name: 'Book' })
// Book ends up with attributes: id, title, subtitle
```

## Not inferred

- Cardinalities beyond one-to-one / one-to-many (no `many-to-many`; that needs a join-table sample)
- Foreign-key attributes that also appear alongside nested objects (no dedup between `author_id` and the `author` nested shape — both become attributes)
- Enum detection from repeated string values (treated as plain `string`)
- Required-vs-optional — every inferred attribute is treated as optional since we can't tell from a single sample

These are all reasonable follow-ups once real usage surfaces patterns worth codifying.

## License

MIT.
