'use client'

import { UISchema, FlowRenderer } from '@/components/schema'
import { sampleLoanApplicationSchema } from './sample-schema'

export default function SchemaRendererDemo() {
  const handleFlowComplete = (data: Record<string, Record<string, unknown>>) => {
    console.log('Flow completed with data:', data)
    alert('Application submitted successfully!')
  }

  const handleStepChange = (stepId: string) => {
    console.log('Changed to step:', stepId)
  }

  // Get the first flow from the sample schema
  const flow = sampleLoanApplicationSchema.flows[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">DNA Schema Renderer Demo</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Dynamic rendering of forms and flows using DNA schema definitions
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg">
          <FlowRenderer
            schema={sampleLoanApplicationSchema}
            flow={flow}
            onFlowComplete={handleFlowComplete}
            onStepChange={handleStepChange}
          />
        </div>

        <div className="mt-10 p-6 sm:p-8 bg-muted/50 border border-border rounded-2xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">ℹ️</span> Schema Information
          </h2>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              <span className="font-medium text-foreground">Schema:</span>
              <span className="font-mono ml-2 px-2.5 py-1 bg-background rounded text-sm text-primary">
                {sampleLoanApplicationSchema.name}
              </span>
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Pages:</span> {sampleLoanApplicationSchema.pages.length} |
              <span className="font-medium text-foreground ml-3">Components:</span> {sampleLoanApplicationSchema.components.length} |
              <span className="font-medium text-foreground ml-3">Flows:</span> {sampleLoanApplicationSchema.flows.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
