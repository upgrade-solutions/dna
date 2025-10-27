"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  GitBranch, 
  Users, 
  ListTodo, 
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
  Zap,
  Database,
  FolderIcon,
  UserIcon,
  HandshakeIcon,
  FileTextIcon,
  BriefcaseIcon,
  NetworkIcon
} from 'lucide-react'

// Map workflow/product names to icons
const iconMap: Record<string, JSX.Element> = {
  "Case Development Platform": <FolderIcon className="w-6 h-6 text-primary" />,
  "Client Acquisition System": <UserIcon className="w-6 h-6 text-primary" />,
  "Legal Partnership Network": <HandshakeIcon className="w-6 h-6 text-primary" />,
  "Case Investigation": <BriefcaseIcon className="w-6 h-6 text-primary" />,
  "Evidence Gathering": <FileTextIcon className="w-6 h-6 text-primary" />,
  "Legal Strategy Development": <NetworkIcon className="w-6 h-6 text-primary" />,
  "Case Filing Preparation": <FileTextIcon className="w-6 h-6 text-primary" />,
  "Victim Identification": <Users className="w-6 h-6 text-primary" />,
  "Client Intake Process": <UserIcon className="w-6 h-6 text-primary" />,
  "Claimant Management": <Users className="w-6 h-6 text-primary" />,
  "Law Firm Partnership": <HandshakeIcon className="w-6 h-6 text-primary" />,
  "Case Distribution": <NetworkIcon className="w-6 h-6 text-primary" />,
};

function getIconForName(name: string) {
  return iconMap[name] || <FileTextIcon className="w-6 h-6 text-primary" />;
}
import { useBusinessModelData } from '@/hooks/use-business-model-data'
import { cn } from '@/lib/utils'

interface AnimationState {
  insertingAt: number | null
  insertingWorkflowId: string | null
  animatingSteps: Set<string>
}

interface BusinessModelViewerProps {
  className?: string
  autoRefresh?: boolean
  refreshTrigger?: number
  onStepClick?: (step: any) => void
  onInsertStep?: (workflowId: string, position: number, step: any) => void
}

export function BusinessModelViewer({ 
  className, 
  autoRefresh = true,
  refreshTrigger,
  onStepClick,
  onInsertStep
}: BusinessModelViewerProps) {
  const [mounted, setMounted] = useState(false)
  const [animationState, setAnimationState] = useState<AnimationState>({
    insertingAt: null,
    insertingWorkflowId: null,
    animatingSteps: new Set()
  })
  // Use sessionStorage to persist step IDs across refreshes
  const [previousStepIds, setPreviousStepIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('businessModelStepIds')
      return stored ? new Set(JSON.parse(stored)) : new Set()
    }
    return new Set()
  })
  const [newStepIds, setNewStepIds] = useState<Set<string>>(new Set())
  
  const { data, loading, error, refreshData, getStepsForWorkflow } = useBusinessModelData(refreshTrigger)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Detect new steps and trigger slide animations
  useEffect(() => {
    if (!mounted || !data.steps.length) return

    const currentStepIds = new Set(data.steps.map(step => step.id))
    
    // On very first initialization, just set the previous IDs without triggering animation
    if (previousStepIds.size === 0) {
      console.log('[BusinessModelViewer] 🏁 Setting baseline step IDs:', Array.from(currentStepIds))
      setPreviousStepIds(currentStepIds)
      sessionStorage.setItem('businessModelStepIds', JSON.stringify(Array.from(currentStepIds)))
      return
    }
    
    const newSteps = data.steps.filter(step => !previousStepIds.has(step.id))
    
    if (newSteps.length > 0) {
      const newIds = new Set(newSteps.map(step => step.id))
      console.log('[BusinessModelViewer] 🎬 ANIMATING NEW STEPS:', newSteps.map(s => `${s.actor} > ${s.action} > ${s.resource}`))
      setNewStepIds(newIds)
      
      // Clear animation after transition duration
      setTimeout(() => {
        setNewStepIds(new Set())
      }, 2500)
      
      // Update previous step IDs and persist to sessionStorage ONLY when new steps are found
      setPreviousStepIds(currentStepIds)
      sessionStorage.setItem('businessModelStepIds', JSON.stringify(Array.from(currentStepIds)))
    }
  }, [data.steps, mounted, refreshTrigger])

  const getStepAnimationClasses = (stepId: string, stepIndex: number, workflowId: string) => {
    const isAnimating = animationState.animatingSteps.has(stepId)
    const isInserting = animationState.insertingWorkflowId === workflowId && 
                       animationState.insertingAt === stepIndex
    const isNewStep = newStepIds.has(stepId)
    
    let classes = 'transition-all duration-300 ease-out '
    
    if (isAnimating) {
      classes += 'transform translate-y-16 '
    }
    
    if (isInserting || isNewStep) {
      classes += 'animate-slide-in animate-new-step-highlight '
      if (isNewStep) {
        console.log('[BusinessModelViewer] 🎨 Applying animation to new step:', stepId)
      }
    }
    
    return classes
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300'
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'in review': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'planned': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <CheckCircle className="h-3 w-3" />
      case 'draft': return <Plus className="h-3 w-3" />
      case 'in review': return <Clock className="h-3 w-3" />
      case 'planned': return <Clock className="h-3 w-3" />
      default: return <AlertCircle className="h-3 w-3" />
    }
  }



  if (!mounted) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Initializing...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading business model data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                className="ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Business Model Data
              <Badge variant="secondary">{data.workflows.length} workflows</Badge>
              <Badge variant="secondary">{data.steps.length} steps</Badge>
            </CardTitle>
            <CardDescription>
              Live view of your Actor {'>'}  Action {'>'}  Resource model
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            className="gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              console.log('[BusinessModelViewer] 🗑️ Clearing sessionStorage baseline')
              sessionStorage.removeItem('businessModelStepIds')
              setPreviousStepIds(new Set())
              window.location.reload()
            }}
            className="gap-1 bg-red-100 hover:bg-red-200"
          >
            Reset Baseline
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={async () => {
              console.log('[BusinessModelViewer] 🧪 Adding test step manually')
              try {
                const response = await fetch('/api/data/steps/insert', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    workflowId: 'wf1',
                    position: 4,
                    step: {
                      actor: 'Test Actor',
                      action: 'Test Action', 
                      resource: 'Test Resource'
                    }
                  })
                })
                if (response.ok) {
                  setTimeout(() => refreshData(), 500)
                }
              } catch (error) {
                console.error('Failed to add test step:', error)
              }
            }}
            className="gap-1 bg-green-100 hover:bg-green-200"
          >
            Add Test Step
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.workflows.map((workflow) => {
            const steps = getStepsForWorkflow(workflow.id)
            
            return (
              <div 
                key={workflow.id} 
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{getIconForName(workflow.name)}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{workflow.name}</h3>
                      <p className="text-sm text-muted-foreground">{workflow.description}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(workflow.status)}>
                    {getStatusIcon(workflow.status)}
                    {workflow.status}
                  </Badge>
                </div>
                
                {steps.length > 0 ? (
                  <div className="space-y-2 group/workflow">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <ListTodo className="h-4 w-4" />
                      Workflow Steps ({steps.length})
                    </div>
                    <div className="space-y-3">
                      {steps.map((step, index) => {
                        const animationClasses = getStepAnimationClasses(step.id, index, workflow.id)
                        
                        return (
                          <div key={step.id}>
                            <div className={animationClasses}>
                              <button
                                onClick={() => onStepClick?.(step)}
                                className={cn(
                                  "workflow-step w-full flex items-center gap-3 p-4 rounded-lg border bg-muted/30 border-border/50 hover:border-primary/50 hover:bg-muted/50 hover:shadow-md transition-all group",
                                  onStepClick && "cursor-pointer"
                                )}
                              >
                              {/* Step Number */}
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-medium text-muted-foreground group-hover:border-primary/50 transition-colors">
                                {step.order}
                              </div>

                              {/* Actor */}
                              <div className="flex items-center gap-2 min-w-[140px]">
                                <Users className="h-4 w-4 text-blue-400" />
                                <div className="text-left">
                                  <div className="text-xs text-muted-foreground">Actor</div>
                                  <div className="text-sm font-medium text-foreground">{step.actor}</div>
                                </div>
                              </div>

                              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                              {/* Action */}
                              <div className="flex items-center gap-2 min-w-[140px]">
                                <Zap className="h-4 w-4 text-amber-400" />
                                <div className="text-left">
                                  <div className="text-xs text-muted-foreground">Action</div>
                                  <div className="text-sm font-medium text-foreground">{step.action}</div>
                                </div>
                              </div>

                              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                              {/* Resource */}
                              <div className="flex items-center gap-2 flex-1">
                                <Database className="h-4 w-4 text-emerald-400" />
                                <div className="text-left">
                                  <div className="text-xs text-muted-foreground">Resource</div>
                                  <div className="text-sm font-medium text-foreground">{step.resource}</div>
                                </div>
                              </div>

                              {step.status && (
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs ml-2", getStatusColor(step.status))}
                                >
                                  {getStatusIcon(step.status)}
                                  {step.status}
                                </Badge>
                              )}
                              </button>
                            </div>

                            {/* Connection line between steps */}
                            {index < steps.length - 1 && (
                              <div className="flex justify-center py-1">
                                <div className="w-px h-4 bg-border" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No steps defined for this workflow
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}