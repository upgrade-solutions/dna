import { StyleBlueprint } from "./style-blueprint"

export function StyleBlueprintSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/10 to-background" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              STYLE SYSTEM
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Brands Create <span className="text-purple-400">Systems</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Transform your brand identity into comprehensive design systems with automated tokens, 
            component libraries, and implementation-ready code
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-mono text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Brand Foundation</h3>
                  <p className="text-sm text-muted-foreground">
                    Define colors, typography, and visual identity elements with precision
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-mono text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Token Generation</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate design tokens, CSS variables, and component variants
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-mono text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Code Export</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate Tailwind configs, CSS frameworks, and component libraries
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-slate-950 rounded-lg border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden">
              <StyleBlueprint />
            </div>
            <div className="absolute -top-4 -right-4 bg-pink-500 text-slate-950 px-4 py-2 rounded-lg font-mono text-sm font-semibold shadow-lg">
              DESIGN SYSTEM
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}