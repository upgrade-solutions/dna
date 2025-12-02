# Digital DNA - Copilot Instructions

## Project Overview

Digital DNA is a **BizOps-as-Code platform** that encodes business operations into structured, machine-readable schemas. Think of it as a "Product Definition Language" that converts natural business conversations into a living digital twin—enabling simulation, validation, documentation generation, and production-ready application deployment.

**Core Philosophy**: Business logic lives in declarative schemas, not scattered in code. Once defined, DNA generates docs, APIs, UIs, and workflows automatically.

## Architecture & Major Components

### Monorepo Structure
```
dna/
├── packages/
│   ├── api-shell/          # Deno: OpenAPI-driven runtime API server
│   ├── pa-app-api/         # Deno: REST API (Neo4j + Neogma OGM)
│   ├── pa-app-ui/          # React + Vite: Product Architect UI
│   ├── ui-shell/           # Next.js 14: Dynamic config-driven UI framework
│   ├── product-architect/  # Next.js 16: DNA framework layer explorer
│   ├── dna-studio-mockup/  # Next.js: Voice capture & DNA schema browser
│   └── libraries/
│       ├── typescript/     # Deno libraries (@dna/core, @dna/engine)
│       └── python/         # Python implementations (planned)
```

### Technology Split
- **Backend APIs**: **Deno** with Oak framework (TypeScript runtime, no build step)
- **Frontend UIs**: **Next.js** (App Router) or **React + Vite**
- **Package Management**: `pnpm` for Next.js apps, Deno's built-in for Deno packages
- **Styling**: Tailwind CSS with shadcn/ui component patterns (dark mode by default)
- **Validation**: Zod schemas throughout
- **Forms**: React Hook Form + Zod resolvers

### Critical Packages

#### `api-shell` - Configuration-Driven API Server ⭐
**Purpose**: Runtime-configurable REST API server—define endpoints, validation, and auth via **OpenAPI 3.1.1 spec** files, no code changes required.

**Key Patterns**:
- All routes, handlers, and schemas defined in `config/openapi.yaml` (source of truth)
- Custom extensions: `x-handler` (CRUD/query/proxy/script/formula), `x-access-control` (RBAC/ABAC), `x-auth`
- Handlers registered in `core/handlers/`, middleware in `core/middleware/`
- Access control: declarative policy-based (see `docs/x-access-control-guide.md`)
- Resource:action pattern for fine-grained permissions (e.g., `user:read`, `project:delete`)

**Commands**:
```bash
cd packages/api-shell
deno task dev     # Hot reload with file watcher
deno task test    # Run test suite (27+ access control tests)
deno task check   # TypeScript validation
```

**Architecture**: `loader.ts` parses OpenAPI → `router.ts` registers routes → `handlers/` execute → `validator.ts` validates against schemas

#### `ui-shell` - Dynamic Configuration-Driven UI ⭐
**Purpose**: Render entire UIs (layouts, pages, forms, workflows) from JSON configuration—no rebuild required.

**Key Patterns**:
- Schema-driven rendering: `components/schema/` contains `FlowRenderer`, `PageRenderer`, `ComponentRenderer`, `FieldRenderer`
- Configuration defines component hierarchy, props, validation rules
- Multi-step flows with progress tracking (`flow-renderer.tsx`)
- Form validation via React Hook Form + Zod
- Type-safe schema resolvers (`resolvers.ts`) find and resolve schema definitions by ID

**Example**:
```tsx
import { FlowRenderer } from '@/components/schema'
<FlowRenderer schema={dnaSchema} flow={registrationFlow} onFlowComplete={submitData} />
```

**Commands**:
```bash
cd packages/ui-shell
pnpm dev    # Next.js dev server on :3000
pnpm build  # Production build
```

**Docs**: `docs/schema-renderer/` contains architecture, migration guides, and testing docs

#### `libraries/typescript/core` - DNA Core Library
**Purpose**: Pre-loaded DNA schemas + validation utilities (Deno package).

**Key Exports**:
```typescript
import { schemas, validateSchema, assertValid } from "@dna/core/schemas"
const result = validateSchema(data, schemas.task)
assertValid(data, schemas.action, "action data") // throws on failure
```

**Available Schemas**: `action`, `actor`, `resource`, `task`, `api`, `endpoint`, `ui`, `component`, `flow`, `page`, `metric`, etc.

#### `dna-studio-mockup` - Voice Capture & DNA Browser
**Purpose**: Capture business knowledge via voice → convert to structured DNA schemas.

**Key Patterns**:
- Organization-centric: each org's DNA in isolated JSON files (`/app/api/data/organizations/*.json`)
- Three-phase flow: Intake → DNA Processing → Structured Output
- Web Audio API integration (`hooks/use-voice-capture.ts`)
- DNA model: `Organization → Products → Workflows → Steps`, plus `Projects` (cross-workflow)

**Existing Copilot Instructions**: See `packages/dna-studio-mockup/.github/copilot-instructions.md` for detailed component patterns

## Development Workflows

### Starting Services

**API Shell (Deno)**:
```bash
cd packages/api-shell
deno task dev  # Watches config/openapi.yaml for changes
```

**PA App API (Deno + Neo4j)**:
```bash
cd packages/pa-app-api
# Configure .env with NEO4J_URL, NEO4J_USERNAME, NEO4J_PASSWORD
deno task dev
```

**UI Shell (Next.js)**:
```bash
cd packages/ui-shell
pnpm dev  # Port 3000
```

**Product Architect (Next.js)**:
```bash
cd packages/product-architect
pnpm dev
```

### Testing
- **Deno packages**: `deno task test` (includes access control, registration flows, validation)
- **Next.js apps**: `pnpm test` (if configured)
- Test fixtures in `packages/api-shell/tests/fixtures/`

### Code Quality
```bash
# Deno
deno fmt      # Format
deno lint     # Lint
deno check    # Type check

# Next.js
pnpm lint     # ESLint
```

## Critical Conventions & Patterns

### 1. OpenAPI as Source of Truth (api-shell)
- **Never** hardcode routes in TypeScript—edit `config/openapi.yaml` instead
- Use `$ref` for schema reuse: `$ref: '#/components/schemas/UserCreateRequest'`
- Custom extensions mandatory: `x-handler` defines behavior, `x-access-control` defines policies
- Resource:action pattern in paths: store in context for granular permission checks

### 2. Schema-Driven Rendering (ui-shell)
- UI components render from JSON schemas, not JSX
- Configuration defines what, not how (component library provides the "how")
- Forms: validation rules live in schema, React Hook Form + Zod execute them
- Multi-step flows: each step is a schema, `FlowRenderer` orchestrates

### 3. Type Safety & Validation
- Zod schemas for runtime validation (both API and UI)
- TypeScript interfaces for compile-time safety
- Validate at boundaries: API requests, form submissions, config loading
- Use `assertValid()` for throw-on-failure, `validateSchema()` for detailed errors

### 4. Component Patterns (Next.js Apps)
- shadcn/ui components in `components/ui/`
- Business components prefixed: `business-model-*`, `voice-*`, `intake-*`
- Custom hooks in `hooks/`: `use-business-model-data.ts`, `use-voice-capture.ts`
- Dark mode by default (via `next-themes` ThemeProvider)

### 5. Access Control (api-shell)
- Policies defined in `components.x-policies`, referenced via `$ref`
- RBAC: fast role matching (e.g., `roles: ["admin"]`)
- ABAC: flexible expressions (e.g., `subject.id == resource.ownerId`)
- Middleware runs before handlers: 401 (no context), 403 (policy denied)
- Context: `{ subject: { id, role }, resource: { id, ownerId }, environment: {} }`

### 6. Handler Types (api-shell)
- **crud**: CRUD operations on resources
- **query**: Database/API queries with select/limit
- **proxy**: Forward to external APIs
- **script**: Execute TypeScript modules (`export default async function(ctx) {}`)
- **formula**: Evaluate expressions (e.g., price calculations)

### 7. REST over tRPC
- **Migration complete**: See `TRPC_TO_REST_MIGRATION.md` for context
- Use standard HTTP verbs, status codes (200, 201, 401, 403, 500)
- Error format: `{ error: string, message: string, details?: unknown }`
- Pagination: `?limit=10&offset=0`

## Key Files to Reference

### When Working on...
- **API routes**: `packages/api-shell/config/openapi.yaml` + `core/handlers/*`
- **Access control**: `packages/api-shell/docs/x-access-control-guide.md`
- **UI configuration**: `packages/ui-shell/components/schema/README.md`
- **DNA schemas**: `packages/libraries/typescript/core/schemas/json/`
- **Type definitions**: `packages/api-shell/core/types.ts`
- **Voice capture**: `packages/dna-studio-mockup/hooks/use-voice-capture.ts`

### Documentation
- Detailed guides in `packages/api-shell/docs/` (access control, feature flags, logging, resource:action)
- Schema renderer docs in `packages/ui-shell/docs/schema-renderer/`
- Multi-step registration example with tests: `packages/api-shell/tests/registration_flow.test.ts`

## Environment Variables

### api-shell
```bash
CONFIG_PATH=./config/openapi.yaml
HOSTNAME=localhost
PORT=3000
WATCH_CONFIG=true
```

### pa-app-api
```bash
PORT=3000
NEO4J_URL=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
```

### Next.js Apps
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Unique Aspects to Remember

1. **No code deploys for API changes**: Edit OpenAPI spec, hot reload handles the rest
2. **Configuration > Code**: UIs render from JSON, APIs from YAML
3. **Deno = no build step**: Import URLs, native TypeScript, secure by default
4. **Dark mode everywhere**: All Next.js apps default to dark theme
5. **Policy-based access control**: Write rules once in `x-policies`, reference everywhere
6. **Multi-step flows**: Built-in support via `FlowRenderer`, tracks progress across steps
7. **Resource:action pattern**: Fine-grained permission model (e.g., can read but not delete)
8. **Living blueprints**: DNA schemas are both documentation AND executable code

## Common Tasks

### Add a new API endpoint (api-shell)
1. Edit `config/openapi.yaml` → add path + operation
2. Define schema in `components.schemas` if needed
3. Reference existing handler or create new one in `core/handlers/`
4. Add `x-handler`, `x-access-control`, and request/response schemas
5. Save—hot reload registers the route

### Add a new UI component (ui-shell)
1. Create component in `components/schema/`
2. Register in component renderer switch statement
3. Reference in configuration JSON
4. Document in schema types

### Add access control policy (api-shell)
1. Define in `components.x-policies`
2. Reference via `$ref` in operation's `x-access-control`
3. Test in `tests/access-control.test.ts`

### Create multi-step flow (ui-shell)
1. Define flow schema with steps
2. Use `FlowRenderer` with `onFlowComplete` callback
3. Handle step validation and transitions
4. Track progress via `onStepChange`

## Gotchas & Anti-Patterns

❌ **Don't** hardcode routes in TypeScript—use OpenAPI config  
❌ **Don't** ignore validation errors—DNA is schema-first  
❌ **Don't** duplicate policies—define once, `$ref` everywhere  
❌ **Don't** mix package managers—Deno for Deno, pnpm for Next.js  
❌ **Don't** skip tests for access control changes—27+ tests exist for a reason  
✅ **Do** leverage existing handlers before writing custom ones  
✅ **Do** check `docs/` folders for detailed guides  
✅ **Do** use `deno check` and `pnpm lint` before committing  
✅ **Do** validate schemas with `@dna/core` utilities

## Questions to Ask Before Implementation

1. Can this be configured declaratively instead of coded?
2. Does this belong in the OpenAPI spec or as a reusable handler?
3. Is there an existing schema/component/policy I can reuse?
4. Should this be RBAC (roles) or ABAC (rules)?
5. Which package does this belong in—API or UI? Deno or Next.js?

---

**Positioning**: Digital DNA is "the language of digital architecture"—a Product Definition Language that turns business conversations into executable applications.
