import { EntityRelationships } from "./entity-relationships"

interface SignalBlueprintSectionProps {
  title?: string
  subtitle?: string
}

export function SignalBlueprintSection({ title, subtitle }: SignalBlueprintSectionProps) {
  const isCompact = !!title
  return (
    <section className={`relative overflow-hidden ${isCompact ? 'py-0 px-0' : 'py-24 px-6'}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-cyan-950/10 to-background" />

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

        {/* Entity Relationships Visualization */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Concept Connections</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize how Actors, Actions, Resources, and Events interconnect and relate
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Semantic Paths</h3>
                  <p className="text-sm text-muted-foreground">
                    Trace meaning flows and semantic dependencies across your concepts
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Impact Visibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand how changes in one concept affect related components
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-cyan-400">Connection Types</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-px bg-cyan-400"></div>
                  <span>Semantic Links</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-px bg-purple-400"></div>
                  <span>Logical Dependencies</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-px bg-green-400"></div>
                  <span>Data Flows</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-slate-950 rounded-lg border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden">
              <EntityRelationships />
            </div>
            <div className="absolute -top-4 -right-4 bg-cyan-500 text-slate-950 px-4 py-2 rounded-lg font-mono text-sm font-semibold shadow-lg">
              KNOWLEDGE GRAPH
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
