import { StructureBlueprint } from "./structure-blueprint"
import { WorkflowVisualization } from "./workflow-visualization"
import { EntityRelationships } from "./entity-relationships"

export function StructureBlueprintSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-emerald-950/10 to-background" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              STRUCTURE SPECIFICATION
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Define Your <span className="text-emerald-400">Entity Architecture</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Map organizational hierarchies, product relationships, and process flows to create
            a clear structural foundation for your applications
          </p>
        </div>

        {/* Main Structure Visualization */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-24">
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
                  <h3 className="font-semibold text-lg mb-1">Relationship Mapping</h3>
                  <p className="text-sm text-muted-foreground">
                    Establish clear relationships and dependencies between entities and processes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Process Flows</h3>
                  <p className="text-sm text-muted-foreground">
                    Model business workflows as sequences of actor-action-resource steps
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-emerald-400">Entity Types</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span>Organizations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span>Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span>Workflows</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span>Process Steps</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-slate-950 rounded-lg border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/20 overflow-hidden">
              <StructureBlueprint />
            </div>
            <div className="absolute -top-4 -right-4 bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg font-mono text-sm font-semibold shadow-lg">
              LIVE STRUCTURE
            </div>
          </div>
        </div>

        {/* Workflow Process Visualization */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-24">
          <div className="relative">
            <div className="aspect-[4/3] bg-slate-950 rounded-lg border-2 border-yellow-500/30 shadow-2xl shadow-yellow-500/20 overflow-hidden">
              <WorkflowVisualization />
            </div>
            <div className="absolute -top-4 -right-4 bg-yellow-500 text-slate-950 px-4 py-2 rounded-lg font-mono text-sm font-semibold shadow-lg">
              PROCESS FLOW
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-mono text-sm">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Actor-Action-Resource Model</h3>
                  <p className="text-sm text-muted-foreground">
                    Define each process step with clear actors, actions, and resources involved
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-mono text-sm">
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Status Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor workflow progress with real-time status updates and completion tracking
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-mono text-sm">
                  6
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Sequential Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Ensure proper step ordering and dependencies for reliable business processes
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-yellow-400">Process Elements</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span>Completed Steps</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <span>Active Steps</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  <span>Pending Steps</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Entity Relationships */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono text-sm">
                  7
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Entity Connections</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize how organizations, products, workflows, and steps interconnect
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-sm">
                  8
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Dependency Paths</h3>
                  <p className="text-sm text-muted-foreground">
                    Trace data flows and process dependencies across your entire system
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono text-sm">
                  9
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Impact Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand how changes in one entity affect related components
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-cyan-400">Relationship Types</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-px bg-cyan-400"></div>
                  <span>Entity Hierarchies</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-px bg-purple-400"></div>
                  <span>Process Dependencies</span>
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
              RELATIONSHIPS
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}