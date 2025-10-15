"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Brain, 
  MessageSquare, 
  Database, 
  GitBranch, 
  Users, 
  ListTodo, 
  FileAudio, 
  Zap,
  CheckCircle,
  Info,
  Loader2
} from 'lucide-react'
import { BusinessModelChange } from '@/hooks/use-conversation-capture'

// Dynamic imports to avoid hydration issues with browser APIs
const ConversationVoiceCapture = dynamic(
  () => import('@/components/conversation-voice-capture').then(mod => ({ default: mod.ConversationVoiceCapture })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }
)

const BusinessModelViewer = dynamic(
  () => import('@/components/business-model-viewer').then(mod => ({ default: mod.BusinessModelViewer })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }
)

export default function ConversationDemo() {
  const [businessModelChanges, setBusinessModelChanges] = useState<BusinessModelChange[]>([])
  const [manualInput, setManualInput] = useState('')
  const [sessionId] = useState(`demo-${Date.now()}`)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // Cleanup timeout on unmount
    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout)
      }
    }
  }, [])

  const handleBusinessModelChange = (changes: BusinessModelChange[]) => {
    setBusinessModelChanges(prev => [...prev, ...changes])
  }

  const handleBusinessModelUpdate = () => {
    // Debounce the refresh to prevent rapid flashing
    if (updateTimeout) {
      clearTimeout(updateTimeout)
    }
    
    const timeout = setTimeout(() => {
      console.log('[ConversationDemo] Business model updated, triggering refresh')
      setRefreshTrigger(prev => prev + 1)
    }, 1000) // Wait 1 second after last update
    
    setUpdateTimeout(timeout)
  }

  const handleStepClick = (step: any) => {
    console.log('Step clicked:', step)
  }

  const sendManualInput = async () => {
    if (!manualInput.trim()) return

    try {
      const response = await fetch('/api/intake/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          transcriptChunk: manualInput,
          chunkIndex: Date.now(),
          forceAnalysis: true
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.businessModelChanges) {
          handleBusinessModelChange(result.businessModelChanges)
          handleBusinessModelUpdate() // Trigger refresh
        }
        setManualInput('')
      }
    } catch (error) {
      console.error('Error sending manual input:', error)
    }
  }

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'workflow': return <GitBranch className="h-4 w-4" />
      case 'step': return <ListTodo className="h-4 w-4" />
      case 'actor': return <Users className="h-4 w-4" />
      case 'resource': return <FileAudio className="h-4 w-4" />
      case 'action': return <Zap className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'create': return 'bg-green-100 text-green-800 border-green-300'
      case 'update': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'delete': return 'bg-red-100 text-red-800 border-red-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

if (!mounted) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Database className="h-8 w-8 text-blue-500" />
          Business Model Conversation Demo
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Loading...
        </p>
      </div>
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </div>
  )
}  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Database className="h-8 w-8 text-blue-500" />
          Business Model Conversation Demo
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Speak or type to describe workflow changes. The AI will analyze your conversation and 
          suggest modifications to your business model using the Actor {'>'}  Action {'>'}  Resource pattern.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Voice Capture */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Voice Input
              </CardTitle>
              <CardDescription>
                Use voice capture to naturally describe workflow changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConversationVoiceCapture 
                onBusinessModelChange={handleBusinessModelChange}
                onBusinessModelUpdate={handleBusinessModelUpdate}
                sessionId={sessionId}
              />
            </CardContent>
          </Card>

          {/* Manual Text Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Manual Input
              </CardTitle>
              <CardDescription>
                Type workflow descriptions for immediate analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe a workflow change... e.g., 'The loan officer should verify income documents before the system checks credit score'"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={sendManualInput}
                disabled={!manualInput.trim()}
                className="w-full"
              >
                Analyze Text
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Business Model Changes - COMMENTED OUT FOR NOW */}
        {/* 
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Business Model Changes
                <Badge variant="secondary">{businessModelChanges.length}</Badge>
              </CardTitle>
              <CardDescription>
                AI-suggested modifications to your Actor {'>'}  Action {'>'}  Resource model
              </CardDescription>
            </CardHeader>
            <CardContent>
              {businessModelChanges.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No changes detected yet. Start speaking or typing to see business model suggestions.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {businessModelChanges.map((change, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getChangeTypeIcon(change.changeType)}
                          <span className="font-medium capitalize">
                            {change.operation} {change.changeType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getOperationColor(change.operation)}>
                            {change.operation}
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(change.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {change.reasoning}
                      </p>
                      
                      {change.data && (
                        <div className="bg-muted p-3 rounded text-sm">
                          {change.changeType === 'step' ? (
                            <div className="font-mono">
                              <span className="text-blue-600">{change.data.actor}</span>
                              {' > '}
                              <span className="text-green-600">{change.data.action}</span>
                              {' > '}
                              <span className="text-purple-600">{change.data.resource}</span>
                            </div>
                          ) : change.changeType === 'workflow' ? (
                            <div>
                              <div className="font-medium">{change.data.name}</div>
                              <div className="text-xs text-muted-foreground">{change.data.description}</div>
                            </div>
                          ) : (
                            <div className="font-mono text-xs">
                              {JSON.stringify(change.data, null, 2)}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {new Date(change.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        */}

        {/* Live Business Model View */}
        <div className="lg:col-span-3">
          <BusinessModelViewer 
            key={`bmv-${refreshTrigger}`}
            refreshTrigger={refreshTrigger}
            onStepClick={handleStepClick}
            className="h-fit"
          />
        </div>
      </div>

      {/* Example Inputs - Moved outside main grid to prevent layout shifts */}
      <Card>
        <CardHeader>
          <CardTitle>Example Inputs to Try</CardTitle>
          <CardDescription>
            Copy and paste these examples to see how the AI interprets workflow changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">New Workflow Step:</h4>
              <p className="text-sm bg-muted p-3 rounded">
                "In the customer onboarding flow we need to add a step after the customer submit the registration form to verify their email"
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Process Change:</h4>
              <p className="text-sm bg-muted p-3 rounded">
                "The risk assessment should happen before the loan officer reviews the application, not after."
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">New Actor:</h4>
              <p className="text-sm bg-muted p-3 rounded">
                "We need a compliance officer to review all high-value loan applications before approval."
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Resource Addition:</h4>
              <p className="text-sm bg-muted p-3 rounded">
                "The underwriter needs access to the customer's tax documents when making approval decisions."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}