import { ArchitectureBlueprint } from "./architecture-blueprint"

export function ArchitectureBlueprintSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/5 to-background" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              ARCHITECTURE SPECIFICATION
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Diagrams Create <span className="text-purple-400">Infrastructure</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Transform your system diagrams into living infrastructure. Every architecture becomes a blueprint for
            scalable, resilient cloud systems.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Blueprint visualization */}
          <div className="relative">
            <div className="aspect-[4/3] bg-[#0a0f1a] rounded-lg border border-purple-500/20 overflow-hidden shadow-2xl shadow-purple-500/10">
              <ArchitectureBlueprint />
            </div>

            {/* Technical labels */}
            <div className="absolute -top-3 -left-3 bg-purple-500 text-white text-xs font-mono px-2 py-1 rounded">
              ARCH-001
            </div>
            <div className="absolute -bottom-3 -right-3 bg-blue-500 text-white text-xs font-mono px-2 py-1 rounded">
              Kubernetes
            </div>
          </div>

          {/* Specification details */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-mono text-purple-400 mb-3">SYSTEM ARCHITECTURE</h3>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground">Services:</span>
                  <span className="text-foreground">Microservice definitions</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="text-foreground">Load balancers and routing</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground">Storage:</span>
                  <span className="text-foreground">Databases and caching layers</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground">Scale:</span>
                  <span className="text-foreground">Auto-scaling and replication</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-mono text-blue-400 mb-3">AUTO-GENERATED</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Infrastructure as Code (IaC)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Container orchestration configs
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Service mesh definitions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Monitoring and observability
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
