import { SemanticsBlueprint } from "./semantics-blueprint"
import { BusinessRulesBlueprint } from "./business-rules-blueprint"
import { OntologyBlueprint } from "./ontology-blueprint"

export function SemanticsBlueprintSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/10 to-background" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              SEMANTICS SPECIFICATION
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Define Your <span className="text-purple-400">Business Intelligence</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Capture business rules, domain logic, and semantic relationships to create 
            intelligent systems that understand context and meaning
          </p>
        </div>

        {/* Main Business Rules Visualization */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-24">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-mono text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Business Rules</h3>
                  <p className="text-sm text-muted-foreground">
                    Define conditions, constraints, and business logic that govern system behavior
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-mono text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Intent Recognition</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture user intentions and map them to appropriate system actions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-mono text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Decision Trees</h3>
                  <p className="text-sm text-muted-foreground">
                    Model complex decision logic with branching paths and conditions
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-purple-400">Rule Types</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span>Validation Rules</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-400"></div>
                  <span>Business Logic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                  <span>Decision Rules</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <span>Process Rules</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-slate-950 rounded-lg border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden">
              <BusinessRulesBlueprint />
            </div>
            <div className="absolute -top-4 -right-4 bg-purple-500 text-slate-950 px-4 py-2 rounded-lg font-mono text-sm font-semibold shadow-lg">
              BUSINESS RULES
            </div>
          </div>
        </div>

        {/* Domain Ontology Visualization */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-24">
          <div className="relative">
            <div className="aspect-[4/3] bg-slate-950 rounded-lg border-2 border-pink-500/30 shadow-2xl shadow-pink-500/20 overflow-hidden">
              <OntologyBlueprint />
            </div>
            <div className="absolute -top-4 -right-4 bg-pink-500 text-slate-950 px-4 py-2 rounded-lg font-mono text-sm font-semibold shadow-lg">
              DOMAIN ONTOLOGY
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-mono text-sm">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Concept Hierarchy</h3>
                  <p className="text-sm text-muted-foreground">
                    Define domain concepts, their properties, and hierarchical relationships
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-mono text-sm">
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Semantic Relations</h3>
                  <p className="text-sm text-muted-foreground">
                    Map relationships between concepts: is-a, part-of, relates-to, depends-on
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-mono text-sm">
                  6
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Knowledge Graph</h3>
                  <p className="text-sm text-muted-foreground">
                    Build interconnected knowledge representations for reasoning and inference
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-pink-400">Semantic Elements</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                  <span>Domain Concepts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                  <span>Property Definitions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span>Relationship Types</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contextual Intelligence */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-sm">
                  7
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Context Awareness</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand situational context and adapt behavior accordingly
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-mono text-sm">
                  8
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Inference Engine</h3>
                  <p className="text-sm text-muted-foreground">
                    Derive new knowledge from existing facts and rules through logical reasoning
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-sm">
                  9
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Adaptive Logic</h3>
                  <p className="text-sm text-muted-foreground">
                    Dynamically adjust business rules based on changing conditions and learning
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-indigo-400">Intelligence Features</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-px bg-indigo-400"></div>
                  <span>Pattern Recognition</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-px bg-blue-400"></div>
                  <span>Predictive Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-px bg-purple-400"></div>
                  <span>Automated Reasoning</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-slate-950 rounded-lg border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/20 overflow-hidden">
              <SemanticsBlueprint />
            </div>
            <div className="absolute -top-4 -right-4 bg-indigo-500 text-slate-950 px-4 py-2 rounded-lg font-mono text-sm font-semibold shadow-lg">
              CONTEXTUAL AI
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}