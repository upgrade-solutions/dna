import { APIBlueprint } from "./api-blueprint"

export function APIBlueprintSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-blue-950/5 to-background" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              API SPECIFICATION
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Definitions Create <span className="text-blue-400">APIs</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Transform your API definitions into living, documented endpoints. Every specification becomes a blueprint
            for robust, type-safe communication.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Blueprint visualization */}
          <div className="relative">
            <div className="aspect-[4/3] bg-[#0a0f1a] rounded-lg border border-blue-500/20 overflow-hidden shadow-2xl shadow-blue-500/10">
              <APIBlueprint />
            </div>

            {/* Technical labels */}
            <div className="absolute -top-3 -left-3 bg-blue-500 text-white text-xs font-mono px-2 py-1 rounded">
              SPEC-001
            </div>
            <div className="absolute -bottom-3 -right-3 bg-cyan-500 text-white text-xs font-mono px-2 py-1 rounded">
              RESTful
            </div>
          </div>

          {/* Specification details */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-mono text-blue-400 mb-3">ENDPOINT STRUCTURE</h3>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="text-foreground">HTTP Verb (GET, POST, PUT, DELETE)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground">Path:</span>
                  <span className="text-foreground">Resource identifier with parameters</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground">Request:</span>
                  <span className="text-foreground">Payload schema and validation</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground">Response:</span>
                  <span className="text-foreground">Return type and status codes</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-mono text-cyan-400 mb-3">AUTO-GENERATED</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Type-safe client SDKs
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  OpenAPI documentation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Request validation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Error handling
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
