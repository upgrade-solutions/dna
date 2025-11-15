import { StateMachineBlueprint } from "./state-machine-blueprint"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StateBlueprintSectionProps {
  title?: string
  subtitle?: string
}

export function StateBlueprintSection({ title, subtitle }: StateBlueprintSectionProps) {
  const isCompact = !!title
  return (
    <section className={`relative overflow-hidden ${isCompact ? 'py-0 px-0' : 'py-24 px-6'}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/5 to-background" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            {title || "State"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {subtitle || "Manage state transitions, lifecycle hooks, and dynamic behavior across your application with predictable state machines and reactive patterns"}
          </p>
        </div>

        <div className="space-y-8">
          {/* State Machine Examples */}
          <Tabs defaultValue="dataFetch" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dataFetch">Data Fetch</TabsTrigger>
              <TabsTrigger value="formSubmission">Form Submission</TabsTrigger>
              <TabsTrigger value="userSession">User Session</TabsTrigger>
            </TabsList>

            <TabsContent value="dataFetch" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="relative">
                  <div className="aspect-[4/3] bg-[#0a0f1a] rounded-lg border border-purple-500/20 overflow-hidden shadow-2xl shadow-purple-500/10">
                    <StateMachineBlueprint example="dataFetch" />
                  </div>
                  <div className="absolute -top-3 -left-3 bg-purple-500 text-white text-xs font-mono px-2 py-1 rounded">
                    STATE-001
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-sm font-mono text-blue-400 mb-3">LIFECYCLE HOOKS</h3>
                    <div className="space-y-2 text-sm font-mono">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-24">onEnter:</span>
                        <span className="text-foreground">Initialize fetch request</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-24">onExit:</span>
                        <span className="text-foreground">Clear timeout, abort request</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-24">retry:</span>
                        <span className="text-foreground">Exponential backoff logic</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-sm font-mono text-cyan-400 mb-3">STATE SCHEMA</h3>
                    <code className="text-xs text-muted-foreground block space-y-1">
                      <div>data: T | null</div>
                      <div>error: Error | null</div>
                      <div>loading: boolean</div>
                      <div>attempts: number</div>
                    </code>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="formSubmission" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="relative">
                  <div className="aspect-[4/3] bg-[#0a0f1a] rounded-lg border border-purple-500/20 overflow-hidden shadow-2xl shadow-purple-500/10">
                    <StateMachineBlueprint example="formSubmission" />
                  </div>
                  <div className="absolute -top-3 -left-3 bg-purple-500 text-white text-xs font-mono px-2 py-1 rounded">
                    STATE-002
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-sm font-mono text-blue-400 mb-3">VALIDATION HOOKS</h3>
                    <div className="space-y-2 text-sm font-mono">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-24">onChange:</span>
                        <span className="text-foreground">Mark dirty, clear errors</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-24">onBlur:</span>
                        <span className="text-foreground">Validate field</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-24">submit:</span>
                        <span className="text-foreground">Validate all, submit</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-sm font-mono text-cyan-400 mb-3">VALIDATION SCHEMA</h3>
                    <code className="text-xs text-muted-foreground block space-y-1">
                      <div>values: Record&lt;string, any&gt;</div>
                      <div>errors: Record&lt;string, string&gt;</div>
                      <div>touched: Set&lt;string&gt;</div>
                      <div>isDirty: boolean</div>
                    </code>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="userSession" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="relative">
                  <div className="aspect-[4/3] bg-[#0a0f1a] rounded-lg border border-purple-500/20 overflow-hidden shadow-2xl shadow-purple-500/10">
                    <StateMachineBlueprint example="userSession" />
                  </div>
                  <div className="absolute -top-3 -left-3 bg-purple-500 text-white text-xs font-mono px-2 py-1 rounded">
                    STATE-003
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-sm font-mono text-blue-400 mb-3">SESSION HOOKS</h3>
                    <div className="space-y-2 text-sm font-mono">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-24">login:</span>
                        <span className="text-foreground">Authenticate user</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-24">tokenExpiring:</span>
                        <span className="text-foreground">Refresh token</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-24">logout:</span>
                        <span className="text-foreground">Clear session data</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-sm font-mono text-cyan-400 mb-3">SESSION SCHEMA</h3>
                    <code className="text-xs text-muted-foreground block space-y-1">
                      <div>user: User | null</div>
                      <div>token: string | null</div>
                      <div>expiresAt: Date | null</div>
                      <div>refreshToken: string | null</div>
                    </code>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
