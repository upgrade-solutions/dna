import { TokensBlueprint } from "./tokens-blueprint"

export function TokensBlueprintSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-amber-950/10 to-background" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              DESIGN TOKENS
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Tokens Create <span className="text-amber-400">Consistency</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Transform visual decisions into systematic design tokens that ensure consistency 
            across platforms, frameworks, and tools
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Token Generation</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate semantic tokens from brand colors and design decisions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-mono text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Multi-Platform Export</h3>
                  <p className="text-sm text-muted-foreground">
                    Export to CSS, Tailwind, JavaScript, Figma, and design tool formats
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Live Synchronization</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep design and development in sync with real-time token updates
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-slate-950 rounded-lg border-2 border-amber-500/30 shadow-2xl shadow-amber-500/20 overflow-hidden">
              <TokensBlueprint />
            </div>
            <div className="absolute -top-4 -right-4 bg-yellow-500 text-slate-950 px-4 py-2 rounded-lg font-mono text-sm font-semibold shadow-lg">
              TOKEN SYSTEM
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}