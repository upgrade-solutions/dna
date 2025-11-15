# Product Architect

A Next.js application for exploring and visualizing the DNA framework's layered architecture across Design, Build, and Run phases.

## Overview

Product Architect is an interactive web application that demonstrates how functionality emerges through a layered architectural approach. It showcases six core framework layers (System, Structure, Schema, State, Signal, and Style) across three phases of product development.

### Key Features

- **Living Blueprints**: Interactive visualizations of UI and API layer architectures
- **Multi-Phase Navigation**: Explore System, Structure, Schema, State, Signal, and Style layers across Design, Build, and Run phases
- **Modern UI**: Built with Next.js 16, React 19, and Tailwind CSS
- **Component Library**: Extensive set of Radix UI components for consistent, accessible interfaces

## Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Package manager (recommended) or npm

## Installation

1. Navigate to the package directory:
```bash
cd packages/product-architect
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

## Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
pnpm dev
# or
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Production Build

Build the application for production:

```bash
pnpm build
# or
npm run build
```

### Production Server

Start the production server (requires build first):

```bash
pnpm start
# or
npm start
```

### Linting

Run ESLint to check code quality:

```bash
pnpm lint
# or
npm run lint
```

## Project Structure

```
product-architect/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Root page (redirects to /home)
│   └── home/              # Home page and sections
│       ├── page.tsx       # Main application page
│       ├── archived/      # Archived blueprint sections
│       └── living-blueprints/  # UI and API layer sections
├── components/            # Reusable React components
│   ├── layout/           # Layout components (footer, theme)
│   └── ui/               # UI component library (Radix-based)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
└── styles/               # Additional stylesheets
```

## Technology Stack

- **Framework**: Next.js 16.0.0
- **React**: 19.2.0
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI primitives
- **Form Management**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode support

## Development

The application is built using Next.js App Router with TypeScript. Key architectural patterns include:

- **Client Components**: Interactive components use `"use client"` directive
- **Layered Architecture**: Six core layers (System, Structure, Schema, State, Signal, Style)
- **Phase-based Navigation**: Design, Build, and Run phases
- **Component Composition**: Modular, reusable components with shadcn/ui patterns

## Configuration

- `next.config.mjs`: Next.js configuration
- `tailwind.config.js`: Tailwind CSS customization
- `tsconfig.json`: TypeScript compiler options
- `components.json`: shadcn/ui component configuration
- `postcss.config.mjs`: PostCSS configuration

## License

Part of the DNA monorepo project.
