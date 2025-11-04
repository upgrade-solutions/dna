# UI Shell

A dynamic Next.js application shell that renders layouts, flows, pages, and components based on JSON configuration. This project provides a flexible, configuration-driven UI framework that enables rapid prototyping and deployment of different UI experiences without code changes.

## Overview

The UI Shell is designed to be a highly configurable application framework where the structure, layout, and behavior of the UI are determined by JSON configuration files rather than hardcoded components. This approach enables:

- **Rapid Prototyping**: Deploy new layouts and flows by updating configuration files
- **Dynamic Rendering**: Render different page layouts and component hierarchies based on configuration
- **No Redeploy Required**: Update UI structure without rebuilding the application
- **Reusable Components**: Define a library of components that can be composed via configuration
- **Multi-Experience Support**: Run multiple different UI experiences from a single application

## Project Structure

```
ui-shell/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout with theme provider
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles
│   └── [routes]/            # Dynamic route pages
├── components/              # Reusable React components
│   ├── theme-provider.tsx   # Theme configuration (light/dark mode)
│   └── [ui-components]/     # Composed UI components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and helpers
├── public/                  # Static assets
├── scripts/                 # Build and automation scripts
├── next.config.mjs          # Next.js configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

## Core Technologies

- **Next.js 14**: React framework for production applications
- **React 18**: JavaScript library for UI components
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Next Themes**: Dark/light theme management
- **React Hook Form**: Efficient form handling
- **Zod**: TypeScript-first schema validation
- **Lucide React**: Icon library

## Getting Started

### Prerequisites

- Node.js 18+ (or compatible Node version)
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Running the Application

```bash
# Development server (with hot reload)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

The application will be available at `http://localhost:3000`.

## Configuration-Driven Architecture

### Configuration Schema

The UI Shell expects JSON configuration files that define:

1. **Page Layouts**: How pages should be structured (header, sidebar, content area, etc.)
2. **Component Hierarchy**: Which components to render and in what order
3. **Flow Definitions**: User interaction flows and transitions between states
4. **Component Props**: Dynamic data and behavior for individual components

### Example Configuration Structure

```json
{
  "pages": [
    {
      "id": "home",
      "path": "/",
      "layout": "default",
      "components": [
        {
          "id": "header",
          "type": "Header",
          "props": {
            "title": "Welcome to DNA Studio",
            "subtitle": "Define your product DNA"
          }
        },
        {
          "id": "content",
          "type": "Container",
          "props": {
            "className": "p-4"
          },
          "children": [
            {
              "type": "Button",
              "props": {
                "label": "Get Started",
                "onClick": "startFlow:intake"
              }
            }
          ]
        }
      ]
    }
  ],
  "flows": [
    {
      "id": "intake",
      "name": "Intake Flow",
      "steps": [
        {
          "id": "step1",
          "type": "form",
          "components": [
            {
              "type": "FormField",
              "props": {
                "name": "email",
                "label": "Email Address",
                "required": true
              }
            }
          ]
        },
        {
          "id": "step2",
          "type": "form",
          "components": []
        }
      ]
    }
  ]
}
```

## Component Library

Components available for use in configuration:

### Layout Components
- **Header**: Top navigation and branding
- **Sidebar**: Side navigation menu
- **Container**: Basic wrapper with styling
- **Grid**: Multi-column layouts
- **Stack**: Vertical/horizontal stacking

### Form Components
- **FormField**: Input field with validation
- **FormSection**: Grouped form fields
- **Button**: Interactive button
- **Select**: Dropdown selection
- **Textarea**: Multi-line text input

### Display Components
- **Card**: Content card with styling
- **Badge**: Tag/label element
- **Alert**: Notification/alert message
- **Skeleton**: Loading placeholder

### Interactive Components
- **Modal**: Modal dialog
- **Tabs**: Tabbed interface
- **Accordion**: Collapsible sections
- **Dropdown**: Dropdown menu

## Theme Configuration

The UI Shell includes built-in dark/light theme support via `next-themes`:

```tsx
// components/theme-provider.tsx
<ThemeProvider
  attribute="class"
  defaultTheme="dark"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

### Using Themes in Components

```tsx
import { useTheme } from 'next-themes'

export function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  )
}
```

## Form Handling

Forms are handled using React Hook Form with Zod validation:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
})

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  )
}
```

## Dynamic Routing

Pages can be created dynamically using Next.js App Router conventions:

```tsx
// app/[slug]/page.tsx
export default function DynamicPage({ params }: { params: { slug: string } }) {
  // Load configuration for this slug
  const config = getPageConfig(params.slug)
  
  return (
    <DynamicPageRenderer config={config} />
  )
}
```

## Styling

The project uses Tailwind CSS for styling. Add custom styles in:

- **Global Styles**: `app/globals.css`
- **Component Styles**: Co-located with components or using Tailwind classes
- **Theme Variables**: Configure in `tailwind.config.js`

## Performance Considerations

- **Code Splitting**: Next.js automatically splits code per route
- **Image Optimization**: Use Next.js `Image` component for optimized images
- **Lazy Loading**: Components can be lazy-loaded using `dynamic()`
- **Configuration Caching**: Cache loaded configurations to reduce parsing overhead

Example lazy loading:

```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
})
```

## Deployment

### Building for Production

```bash
pnpm build
```

### Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# External Service Keys
NEXT_PUBLIC_EXTERNAL_SERVICE=your_key_here

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## Development Workflow

### Adding a New Page

1. Create a configuration file: `public/config/pages/my-page.json`
2. Create a dynamic route handler: `app/pages/[slug]/page.tsx`
3. Load and render the configuration in the page component

### Adding a New Component

1. Create the component in `components/`
2. Register it in the component registry
3. Reference it in configuration files

### Building Custom Hooks

Place reusable logic in `hooks/`:

```tsx
// hooks/usePageConfig.ts
export function usePageConfig(slug: string) {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPageConfig(slug).then(config => {
      setConfig(config)
      setLoading(false)
    })
  }, [slug])

  return { config, loading }
}
```

## Testing

(Add testing setup as needed)

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Troubleshooting

### Hot Reload Not Working
- Clear `.next` folder: `rm -rf .next`
- Restart dev server: `pnpm dev`

### Build Errors
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Check Node version: `node --version` (should be 18+)

### Theme Not Applying
- Ensure `ThemeProvider` wraps the app
- Clear browser cache and hard refresh (Cmd+Shift+R)

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run linting: `pnpm lint`
4. Commit with clear messages
5. Push to GitHub and create a Pull Request

## License

This project is part of the DNA architecture suite.

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
