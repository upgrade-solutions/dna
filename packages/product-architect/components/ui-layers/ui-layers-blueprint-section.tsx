import { UILayersBlueprint } from "./ui-layers-blueprint"

interface UILayersBlueprintSectionProps {
  title?: string
  subtitle?: string
}

export function UILayersBlueprintSection({ title, subtitle }: UILayersBlueprintSectionProps) {
  const isCompact = !!title
  return (
    <section className={`relative overflow-hidden ${isCompact ? 'py-0 px-0' : 'py-8 px-6'}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-blue-950/10 to-background" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-1 gap-8">
          <div className="space-y-6">
            <div className="relative">
              <div className="bg-slate-950 rounded-lg border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20 overflow-hidden p-0">
                <UILayersBlueprint />
              </div>
              <div className="absolute -top-4 -right-4 bg-blue-500 text-slate-950 px-4 py-2 rounded-lg font-mono text-sm font-semibold shadow-lg">
                LAYERS
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
