import { DatabaseBlueprint } from "./database-blueprint"

interface SchemaBlueprintSectionProps {
  title?: string
  subtitle?: string
}

export function SchemaBlueprintSection({ title, subtitle }: SchemaBlueprintSectionProps) {
  const isCompact = !!title
  return (
    <section className={`relative overflow-hidden ${isCompact ? 'py-0 px-0' : 'py-24 px-4'}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-cyan-950/5 to-background" />

      <div className="max-w-7xl mx-auto relative">
        {title && (
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Blueprint visualization */}
          <div className="relative">
            <div className="aspect-[4/3] bg-[#0a0f1a] rounded-lg border border-cyan-500/20 overflow-hidden shadow-2xl shadow-cyan-500/10">
              <DatabaseBlueprint />
            </div>

            {/* Technical labels */}
            <div className="absolute -top-3 -left-3 bg-cyan-500 text-white text-xs font-mono px-2 py-1 rounded">
              SCHEMA-001
            </div>
            <div className="absolute -bottom-3 -right-3 bg-blue-500 text-white text-xs font-mono px-2 py-1 rounded">
              PostgreSQL
            </div>
          </div>

          {/* Specification details */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-mono text-cyan-400 mb-3">SCHEMA STRUCTURE</h3>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground">Tables:</span>
                  <span className="text-foreground">Entity definitions with columns</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground">Relations:</span>
                  <span className="text-foreground">Foreign keys and constraints</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground">Indexes:</span>
                  <span className="text-foreground">Performance optimization rules</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground">Types:</span>
                  <span className="text-foreground">Custom data types and enums</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-mono text-blue-400 mb-3">AUTO-GENERATED</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Migration scripts
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Type-safe ORM models
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Query builders
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Seed data templates
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
