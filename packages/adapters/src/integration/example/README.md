# `@dna-codes/dna-integration-example`

Template for building a DNA `integration-*` package. An integration connects an external system (Jira, GitHub, Notion, Linear, Salesforce, …) to DNA **bidirectionally** and ships three surfaces:

1. **Outbound API calls** — `createClient()` with auth, pagination, pull/push.
2. **Inbound webhooks** — HMAC-verified event parsing with a Node handler.
3. **A CLI** — `integration-example pull|push|serve`.

The external system in this template is a fictional "ExampleCo" issue tracker with `Item` records. Replace every `External*` shape with the real API's.

Zero runtime dependencies. Node 18+ (uses global `fetch` and the built-in `crypto` / `http` modules).

## Install

```bash
npm install @dna-codes/dna-integration-example
```

## Programmatic usage

### Pull DNA from the external system

```ts
import { createClient } from '@dna-codes/dna-integration-example'

const client = createClient({
  baseUrl: 'https://api.example.com',
  apiToken: process.env.EXAMPLE_API_TOKEN!,
})

const dna = await client.pullDna()
```

### Push DNA to the external system

```ts
await client.pushDna(dna)
```

### Handle inbound webhooks (any framework)

```ts
import { parseWebhook } from '@dna-codes/dna-integration-example'

app.post('/webhooks/example', async (req, res) => {
  try {
    const event = parseWebhook(req.rawBody, req.headers, {
      secret: process.env.EXAMPLE_WEBHOOK_SECRET!,
    })
    // ... dispatch on event.type
    res.status(200).end()
  } catch (err) {
    res.status(err.status ?? 500).end(err.message)
  }
})
```

### Handle inbound webhooks (plain Node `http`)

```ts
import { createServer } from 'http'
import { createNodeHandler } from '@dna-codes/dna-integration-example'

const handler = createNodeHandler(
  { secret: process.env.EXAMPLE_WEBHOOK_SECRET! },
  async (event) => {
    console.log(event.type, event.item.id)
  },
)

createServer((req, res) => handler(req, res)).listen(3000)
```

## CLI

After `npm run build`, the `integration-example` bin is available on the package:

```bash
export EXAMPLE_BASE_URL=https://api.example.com
export EXAMPLE_API_TOKEN=...

# Fetch everything and write a DNA JSON file.
npx integration-example pull --out dna.json

# Push a DNA JSON file back to the external system.
npx integration-example push --in dna.json

# Listen for webhooks and log them.
export EXAMPLE_WEBHOOK_SECRET=shared-secret
npx integration-example serve --port 3000
```

## API surface

| Export | Purpose |
|---|---|
| `createClient(options)` | Build an API client with `listItems`, `createItem`, `pullDna`, `pushDna` |
| `parseWebhook(body, headers, opts)` | Verify signature and return a typed `WebhookEvent` |
| `verifySignature(body, header, secret)` | Constant-time HMAC-SHA256 check |
| `createNodeHandler(opts, onEvent)` | Minimal `http.IncomingMessage` → event adapter |
| `itemsToDna(items, domain)` / `dnaToItems(dna)` | Pure mapping helpers |
| `runCli(argv, env?)` | Programmatic CLI entry |

## Architecture

```
src/
  client.ts      outbound HTTP, auth, pagination
  webhook.ts     inbound HMAC + Node handler
  cli.ts         argv parsing + command dispatch
  mapping.ts     pure external ↔ DNA translation
  types.ts       external-system and webhook shapes
  dna-types.ts   loose DNA subset (don't import from @dna-codes/dna-core)
  index.ts       barrel exports
bin/
  integration-example.js   shim that requires dist/cli.js
```

## License

MIT.
