import { ComponentsBlueprint } from "./components-blueprint"

export function ComponentsBlueprintSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-green-950/10 to-background" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-xs font-mono text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              COMPONENT LIBRARY
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Systems Create <span className="text-green-400">Libraries</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Generate production-ready component libraries with variants, documentation, 
            and testing across multiple frameworks and platforms
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-mono text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Component Generation</h3>
                  <p className="text-sm text-muted-foreground">
                    Auto-generate components with variants, props, and styling from design tokens
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Multi-Framework Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Export to React, Vue, Angular, Svelte, and Web Components
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-mono text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Documentation & Testing</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic documentation, Storybook stories, and accessibility tests
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-slate-950 rounded-lg border-2 border-green-500/30 shadow-2xl shadow-green-500/20 overflow-hidden">
              <ComponentsBlueprint />
            </div>
            <div className="absolute -top-4 -right-4 bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg font-mono text-sm font-semibold shadow-lg">
              COMPONENT LIB
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}