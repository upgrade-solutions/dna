import { StructureBlueprint } from "./structure-blueprint"

interface StructureBlueprintSectionProps {
  title?: string
  subtitle?: string
}

export function StructureBlueprintSection({ title, subtitle }: StructureBlueprintSectionProps) {
  const isCompact = !!title
  return (
    <section className={`relative overflow-hidden ${isCompact ? 'py-0 px-0' : 'py-24 px-6'}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-emerald-950/10 to-background" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            {title || "Structure"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {subtitle || "Model your product DNA as interconnected Actors, Actions, Resources, and Events, creating a unified semantic foundation for your entire system"}
          </p>
        </div>

        {/* Main Structure Visualization */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Hierarchical Entities</h3>
                  <p className="text-sm text-muted-foreground">
                    Define organizations, products, workflows, and steps in a structured hierarchy
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-mono text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Semantic Connections</h3>
                  <p className="text-sm text-muted-foreground">
                    Establish clear relationships and dependencies between core concepts
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Universal Building Blocks</h3>
                  <p className="text-sm text-muted-foreground">
                    Model your product DNA as Actors, Actions, Resources, and Events
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-emerald-400">Core Concepts</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span>Actors</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span>Actions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span>Resources</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span>Events</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-slate-950 rounded-lg border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/20 overflow-hidden">
              <StructureBlueprint />
            </div>
            <div className="absolute -top-4 -right-4 bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg font-mono text-sm font-semibold shadow-lg">
              CONCEPTS
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
