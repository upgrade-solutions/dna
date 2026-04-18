# `@dna-codes/output-text`

Render DNA documents as plain prose. Two shapes:

| Shape | Export | Return | Use when |
|---|---|---|---|
| Document | `render(dna, opts?)` | `string` | You need a single combined artifact (a README, an email draft, a doc page). |
| Documents | `renderMany(dna, opts?)` | `Array<{ id, title, body }>` | Downstream expects N records per DNA (Jira Stories, GitHub Issues, Notion pages, DB rows). |

Zero runtime dependencies. Pure, synchronous, never throws on partial DNA.

## Install

```bash
npm install @dna-codes/output-text
```

## `styles` map — picks which units to emit and how

Both `render` and `renderMany` accept a `styles` option:

```ts
type Style = 'user-story' | 'gherkin' | 'product-dna'
type Unit  = 'capability' | 'noun' | 'process'
type StyleMap = Partial<Record<Unit, Style>>
```

The **keys** choose which DNA primitives get rendered; the **values** choose the body template for each. Default: `{ capability: 'user-story' }`.

### Styles

| Style | Fits | Body template |
|---|---|---|
| `user-story` | Capability | `**As a** role` / `**I want to**` / `**So that**` + `Triggered by` + `Acceptance criteria` |
| `gherkin` | Capability | `Feature:` / `Scenario:` / `Given` / `When` / `Then` |
| `product-dna` | Capability, Noun, Process | Key-value blocks using Product-DNA vocabulary (`Resource`, `Action`, `Actor`, `Role`, `Field`, `Operation`) |

Noun and Process always render as `product-dna` regardless of the style requested — `user-story` and `gherkin` are action-shaped and don't translate to entities or workflows.

## `render(dna, options?)`

Returns one markdown-flavored document with one section per unit in the `styles` map.

```ts
import { render } from '@dna-codes/output-text'

const doc = render(dna, {
  title: 'Lending — Spec',
  styles: {
    capability: 'user-story',
    noun: 'product-dna',
    process: 'product-dna',
  },
})
```

## `renderMany(dna, options?)`

Returns one document per primitive. Each entry has a stable `id`, a short `title`, and a markdown `body`.

```ts
import { renderMany } from '@dna-codes/output-text'

const docs = renderMany(dna, { styles: { capability: 'gherkin' } })
// [
//   { id: 'capability-loan-apply',   title: 'Apply Loan',   body: 'Feature: Apply Loan ...' },
//   { id: 'capability-loan-approve', title: 'Approve Loan', body: 'Feature: Approve Loan ...' },
// ]
```

### Multi-unit output

Request several units at once; results come back in canonical order (capability → noun → process):

```ts
renderMany(dna, {
  styles: { capability: 'product-dna', noun: 'product-dna', process: 'product-dna' },
})
// → [
//   { id: 'capability-…', … },
//   { id: 'noun-…', … },
//   { id: 'process-…', … },
// ]
```

### IDs

`id` is always `{unit}-{kebab-slug}`, e.g. `capability-loan-apply`, `noun-loan`, `process-loan-onboarding`. The unit prefix prevents collisions when multiple unit types are emitted in one call.

## API surface

| Export | Purpose |
|---|---|
| `render(dna, options?)` | Combined document (single string) |
| `renderMany(dna, options?)` | Per-unit documents (array of `{id, title, body}`) |
| `DEFAULT_STYLES` | The `{ capability: 'user-story' }` default as a constant |
| Types: `TextDocument`, `Unit`, `Style`, `StyleMap`, `RenderOptions`, `RenderManyOptions` | |

## License

MIT.
