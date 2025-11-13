import { ThemeBlueprint } from "./theme-blueprint"

export function ThemeBlueprintSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-pink-950/10 to-background" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-xs font-mono text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
              THEME STUDIO
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Brands Create <span className="text-pink-400">Experiences</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Build comprehensive theme systems with live previews, accessibility validation, 
            and multi-format exports for seamless implementation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-mono text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Live Theme Editor</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time visual customization with instant preview across all components
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-mono text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Accessibility Validation</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic contrast checking and WCAG compliance testing for all themes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-mono text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Theme Variants</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate light, dark, and custom theme variations automatically
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-slate-950 rounded-lg border-2 border-pink-500/30 shadow-2xl shadow-pink-500/20 overflow-hidden">
              <ThemeBlueprint />
            </div>
            <div className="absolute -top-4 -right-4 bg-rose-500 text-slate-950 px-4 py-2 rounded-lg font-mono text-sm font-semibold shadow-lg">
              LIVE THEMES
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}