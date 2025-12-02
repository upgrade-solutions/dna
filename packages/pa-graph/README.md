# Product Architect Graph

A graph-based visual editor for designing and manipulating business models and workflows using JointJS Plus.

## Technology Stack

- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.2.4 (fast HMR, ES modules)
- **Bundler**: `@vitejs/plugin-react` (Fast Refresh enabled)
- **Workflow Engine**: XState 5.x (tool modes, save workflows)
- **State Management**: MobX (graph model state)
- **Validation**: Zod schemas
- **Styling**: CSS modules + global styles (dark theme)
- **Diagram Library**: JointJS Plus 4.1.1
- **Package Manager**: npm (use `npm install`, not pnpm)

## Development Commands

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Type-check and build for production
npm run preview  # Preview production build
npm run lint     # Lint code
```

## Documentation

See the `/docs` directory for detailed architectural guidance:

- **[State Architecture](docs/STATE_ARCHITECTURE.md)** — Three-layer state model, MobX + XState patterns
- **[File Structure](docs/FILE_STRUCTURE.md)** — Directory organization and separation of concerns
