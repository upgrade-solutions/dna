import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { EventFlowDiagram } from "./event-flow-diagram"

interface SignalBlueprintSectionProps {
  title?: string
  subtitle?: string
}

export function SignalBlueprintSection({ title, subtitle }: SignalBlueprintSectionProps) {
  const isCompact = !!title
  return (
    <section className={`relative overflow-hidden ${isCompact ? 'py-0 px-0' : 'py-24 px-6'}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-yellow-950/10 to-background" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            {title || "Signal"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {subtitle || "Design and implement event-driven communication across your UI and backend architecture. Model flows, implement event buses, and monitor live events and feedback loops."}
          </p>
        </div>

        {/* Event-Driven Architecture Tabs */}
        <Tabs defaultValue="design" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="design">Design Phase</TabsTrigger>
            <TabsTrigger value="build">Build Phase</TabsTrigger>
            <TabsTrigger value="run">Run Phase</TabsTrigger>
          </TabsList>

          {/* Design Phase: Event Flows & Patterns */}
          <TabsContent value="design" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="relative">
                <div className="aspect-[4/3] bg-[#0a0f1a] rounded-lg border border-yellow-500/20 overflow-hidden shadow-2xl shadow-yellow-500/10">
                  <EventFlowDiagram phase="design" />
                </div>
                <div className="absolute -top-3 -left-3 bg-yellow-500 text-slate-950 text-xs font-mono px-2 py-1 rounded font-semibold">
                  SIGNAL-DESIGN
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-mono text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Event Taxonomy</h3>
                      <p className="text-sm text-muted-foreground">
                        Define domain events, UI events, and system events with clear naming conventions and payload schemas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Publisher/Subscriber Model</h3>
                      <p className="text-sm text-muted-foreground">
                        Map which components publish events and which subscribe to them. Define coupling boundaries and event chains.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-mono text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Trigger Flows</h3>
                      <p className="text-sm text-muted-foreground">
                        Model cause-and-effect: which events trigger actions, state transitions, or downstream events.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-yellow-500/10">
                  <h4 className="font-semibold text-sm mb-3 text-yellow-400">Event Categories</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className="text-muted-foreground">Domain Events (business logic)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <span className="text-muted-foreground">UI Events (user interactions)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                      <span className="text-muted-foreground">System Events (lifecycle, errors)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Build Phase: Event Infrastructure */}
          <TabsContent value="build" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="relative">
                <div className="aspect-[4/3] bg-[#0a0f1a] rounded-lg border border-yellow-500/20 overflow-hidden shadow-2xl shadow-yellow-500/10">
                  <EventFlowDiagram phase="build" />
                </div>
                <div className="absolute -top-3 -left-3 bg-yellow-500 text-slate-950 text-xs font-mono px-2 py-1 rounded font-semibold">
                  SIGNAL-BUILD
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-mono text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Event Bus Implementation</h3>
                      <p className="text-sm text-muted-foreground">
                        Build pub/sub infrastructure, message queues, or event brokers. Choose between synchronous and asynchronous patterns.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Listener & Handler Setup</h3>
                      <p className="text-sm text-muted-foreground">
                        Implement event listeners, handlers, and middleware. Add error handling, retries, and dead-letter queues.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-mono text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Event Schema & Serialization</h3>
                      <p className="text-sm text-muted-foreground">
                        Define event types, validation rules, and serialization formats. Enable cross-system compatibility.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-yellow-500/10">
                  <h4 className="font-semibold text-sm mb-3 text-yellow-400">Implementation Patterns</h4>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-20">Sync:</span>
                      <span className="text-foreground">Direct function calls, Observables</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-20">Async:</span>
                      <span className="text-foreground">Message queues, Event streams</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-20">Hybrid:</span>
                      <span className="text-foreground">Event sourcing + CQRS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Run Phase: Event Monitoring */}
          <TabsContent value="run" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="relative">
                <div className="aspect-[4/3] bg-[#0a0f1a] rounded-lg border border-yellow-500/20 overflow-hidden shadow-2xl shadow-yellow-500/10">
                  <EventFlowDiagram phase="run" />
                </div>
                <div className="absolute -top-3 -left-3 bg-yellow-500 text-slate-950 text-xs font-mono px-2 py-1 rounded font-semibold">
                  SIGNAL-RUN
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-mono text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Live Event Monitoring</h3>
                      <p className="text-sm text-muted-foreground">
                        Track event flow in real-time. Monitor event latency, throughput, and propagation paths across the system.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Telemetry & Alerts</h3>
                      <p className="text-sm text-muted-foreground">
                        Collect metrics on event handling, subscriber performance, and failure rates. Alert on anomalies.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-mono text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Feedback Loops</h3>
                      <p className="text-sm text-muted-foreground">
                        Use event data to refine system behavior. Adapt based on user signals and system feedback.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-yellow-500/10">
                  <h4 className="font-semibold text-sm mb-3 text-yellow-400">Monitoring Metrics</h4>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-20">Events/sec:</span>
                      <span className="text-foreground">Throughput</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-20">Latency:</span>
                      <span className="text-foreground">End-to-end propagation</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-20">Failed:</span>
                      <span className="text-foreground">Handler errors & retries</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
