# `@dna-codes/dna-output-html`

Render DNA documents as HTML — opinionated documentation output with configurable sections. Sibling of [`@dna-codes/dna-output-markdown`](../output-markdown/); same sections, same options, same zero-dependency footprint.

## Install

```bash
npm install @dna-codes/dna-output-html
```

## Usage

```ts
import { render } from '@dna-codes/dna-output-html'
import operational from './dna/acme/operational.json'

const html = render({ operational })
// → '<h1>acme</h1><section><h2>Summary</h2>…'
```

Pick specific sections:

```ts
render(
  { operational },
  { sections: ['summary', 'sops'], title: 'Acme SOP Handbook' },
)
```

Emit a complete HTML document:

```ts
render({ operational }, { standalone: true })
// → '<!DOCTYPE html><html>…<body>…</body></html>'
```

## API

### `render(dna, options?)`

Returns an HTML string.

**`RenderOptions`**:

| Option | Default | Meaning |
|--------|---------|---------|
| `sections` | `DEFAULT_SECTIONS` | Ordered list of sections to include |
| `title` | domain's `path` or `name` | Heading text for the document title |
| `headingLevel` | `1` | Top-level heading depth (`1` or `2`). Sections nest one level below. |
| `standalone` | `false` | Wrap output as a full `<!DOCTYPE html>` document |

**`Section`** values: `'summary'`, `'domain-model'`, `'capabilities'`, `'sops'`, `'process-flow'`.

See [`@dna-codes/dna-output-markdown`](../output-markdown/) for section-by-section details — content maps 1:1, just rendered as semantic HTML (`<section>`, `<table>`, `<ul>`, `<ol>`, `<code>`, `<strong>`) instead of markdown.

## License

MIT.
