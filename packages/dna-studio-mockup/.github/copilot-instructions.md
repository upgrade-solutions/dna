# DNA Studio Copilot Instructions

## Architecture Overview

DNA Studio is a Next.js application for capturing, processing, and visualizing business requirements into structured "DNA" schemas. It follows an organization-centric data architecture where each organization's complete business DNA (products, workflows, steps, projects, and resource schemas) is contained in isolated JSON files.

## Key Architectural Patterns

### Organization-Centric Data Structure
- Data lives in `/app/api/data/organizations/*.json` - each organization is self-contained
- Global config in `/app/api/data/config.json` contains organization references and shared UI settings
- The `data-loader.ts` utility provides caching and backward compatibility for API routes
- Client-side data access uses `/lib/data.ts` which imports organization files directly

### DNA Schema Model
The core business model follows a hierarchical structure:
```
Organization → Products → Workflows → Steps
                      → Projects (cross-workflow)
```

### Three-Phase Process Flow
1. **Intake**: Voice capture and transcription (`/app/intake/`, `/components/voice-capture.tsx`)
2. **DNA Processing**: AI-powered extraction and structuring (conceptual, not fully implemented)  
3. **Output**: Structured schemas ready for implementation (`/app/studio/`)

## Development Conventions

### Component Organization
- UI components in `/components/ui/` follow shadcn/ui patterns
- Business components in `/components/` use specific prefixes:
  - `business-model-*` for data visualization
  - `voice-*` for audio capture
  - `intake-*` for requirement gathering

### Data Management Patterns
- Use custom hooks for data operations (`/hooks/use-business-model-data.ts`, `/hooks/use-voice-capture.ts`)
- API routes follow REST patterns under `/app/api/data/`
- Client-side state management uses React hooks with optimistic updates
- Global data caching in API routes using `global.*` variables

### Voice Capture Integration
- Web Audio API integration in `use-voice-capture.ts` 
- Audio metadata tracking with session IDs and source classification
- Real-time transcription preparation (hooks exist, backend TBD)

## Key Files & Responsibilities

- `/app/dashboard.tsx` - Main landing page with process overview
- `/app/studio/page.tsx` - DNA schema browser and editor (1900+ lines)
- `/lib/data.ts` - Primary data access layer with type definitions
- `/app/api/data/shared/data-loader.ts` - Server-side data caching utility
- `/components/business-model-viewer.tsx` - Workflow visualization with step insertion

## Build & Development

```bash
# Start development server
pnpm dev

# Update organization data (custom script)
pnpm run update-organizations

# Build for production
pnpm build
```

## Project-Specific Considerations

- **Dark theme by default** - UI components assume dark mode styling
- **Mock data structure** - Organization data is currently static JSON files
- **Voice capture ready** - Audio infrastructure exists, awaiting transcription backend
- **Semantic versioning** - Products/features follow semver with status tracking
- **Next.js App Router** - Uses app directory structure, not pages
- **TypeScript strict mode** - Build ignores TS errors for rapid prototyping (see `next.config.mjs`)

## When Working on This Codebase

1. **Data Changes**: Update organization JSON files and run the update script
2. **New Features**: Follow the three-workspace pattern (Build/Connect/Coordinate) from the docs
3. **UI Components**: Extend shadcn/ui components, maintain dark theme consistency
4. **API Routes**: Use the data-loader utility for consistent caching
5. **Voice Features**: Build on existing hooks, prepare for transcription service integration

The codebase prioritizes rapid iteration and mockup functionality over production-ready patterns, but maintains a clear architectural vision for future development.