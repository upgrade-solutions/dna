import { UIBlueprint } from "./ui-blueprint"

export function UIBlueprintSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-blue-950/10 to-background" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              UI SPECIFICATION
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Designs Create <span className="text-blue-400">UIs</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Watch as your design specifications transform into construction-ready blueprints, complete with
            measurements, layouts, and responsive behaviors
          </p>
        </div>

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
              LIVE BLUEPRINT
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
