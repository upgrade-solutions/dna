import { UIBlueprint } from "./ui-blueprint"

interface MetricsBlueprintSectionProps {
  title?: string
  subtitle?: string
}

export function MetricsBlueprintSection({ title, subtitle }: MetricsBlueprintSectionProps) {
  const isCompact = !!title
  return (
    <section className={`relative overflow-hidden ${isCompact ? 'py-0 px-0' : 'py-24 px-6'}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-blue-950/10 to-background" />

      <div className="max-w-7xl mx-auto relative z-10">
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

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-mono text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Design Specification</h3>
                  <p className="text-sm text-muted-foreground">
                    Define your UI components, layouts, and interactions in a structured format
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Blueprint Generation</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate technical blueprints with dimensions, spacing, and grid systems
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-mono text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Living Components</h3>
                  <p className="text-sm text-muted-foreground">
                    Transform blueprints into production-ready, responsive React components
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-slate-950 rounded-lg border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20 overflow-hidden">
              <UIBlueprint />
            </div>
            <div className="absolute -top-4 -right-4 bg-cyan-500 text-slate-950 px-4 py-2 rounded-lg font-mono text-sm font-semibold shadow-lg">
              METRICS
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
