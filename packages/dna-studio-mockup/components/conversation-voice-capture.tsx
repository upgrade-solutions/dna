"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Mic, 
  Square, 
  Trash2, 
  AlertCircle,
  Clock,
  FileAudio,
  Brain,
  CheckCircle,
  Users,
  ListTodo,
  GitBranch,
  Zap,
  RefreshCw,
  MessageSquare,
  Database
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConversationCapture, BusinessModelChange } from '@/hooks/use-conversation-capture'

interface ConversationVoiceCaptureProps {
  onBusinessModelChange?: (changes: BusinessModelChange[]) => void
  onBusinessModelUpdate?: () => void
  className?: string
  disabled?: boolean
  sessionId?: string
}

export function ConversationVoiceCapture({
  onBusinessModelChange,
  onBusinessModelUpdate,
  className,
  disabled = false,
  sessionId
}: ConversationVoiceCaptureProps) {
  const [lastChanges, setLastChanges] = useState<BusinessModelChange[]>([])
  const [showChangesDetail, setShowChangesDetail] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    conversationState,
    isListening,
    isSupported,
    currentTranscript,
    speechError,
    startConversationCapture,
    stopConversationCapture,
    clearConversation,
    forceAnalysis
  } = useConversationCapture({
    sessionId,
    autoAnalyzeInterval: 2, // Analyze every 2 chunks
    onBusinessModelChange: (changes) => {
      setLastChanges(changes)
      if (onBusinessModelChange) {
        onBusinessModelChange(changes)
      }
    },
    onBusinessModelUpdate: onBusinessModelUpdate,
    onError: (error) => {
      console.error('Conversation error:', error)
    }
  })

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'workflow': return <GitBranch className="h-3 w-3" />
      case 'step': return <ListTodo className="h-3 w-3" />
      case 'actor': return <Users className="h-3 w-3" />
      case 'resource': return <FileAudio className="h-3 w-3" />
      case 'action': return <Zap className="h-3 w-3" />
      default: return <CheckCircle className="h-3 w-3" />
    }
  }

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'create': return 'text-green-600 bg-green-50 border-green-200'
      case 'update': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'delete': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (!mounted) {
    return (
      <Card className={cn("p-6 bg-card border-border", className)}>
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading voice capture...</span>
        </div>
      </Card>
    )
  }

  if (!isSupported) {
    return (
      <Card className={cn("p-6 bg-card border-border", className)}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Voice capture is not supported in this browser. Please use Chrome, Edge, or Safari.
          </AlertDescription>
        </Alert>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6 bg-card border-border", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={cn(
            "h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300",
            isListening 
              ? 'bg-blue-500/20 border-2 border-blue-500/50 animate-pulse' 
              : conversationState.isProcessing
              ? 'bg-yellow-500/20 border-2 border-yellow-500/50'
              : conversationState.chunks.length > 0
              ? 'bg-green-500/20 border-2 border-green-500/50'
              : 'bg-gray-500/10 border-2 border-gray-500/30'
          )}>
            {isListening ? (
              <Mic className="h-8 w-8 text-blue-400" />
            ) : conversationState.isProcessing ? (
              <Brain className="h-8 w-8 text-yellow-400 animate-pulse" />
            ) : conversationState.chunks.length > 0 ? (
              <MessageSquare className="h-8 w-8 text-green-400" />
            ) : (
              <Mic className="h-8 w-8 text-gray-400" />
            )}
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-400" />
              Business Model Conversation Capture
            </h3>
            <p className="text-sm text-muted-foreground">
              {isListening 
                ? 'Listening for workflow changes...'
                : conversationState.isProcessing
                ? 'Analyzing business model changes...'
                : conversationState.chunks.length > 0
                ? `${conversationState.chunks.length} chunks captured`
                : 'Start speaking to describe workflow changes'
              }
            </p>
          </div>
        </div>

        {/* Conversation Stats */}
        {conversationState.chunks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-lg font-semibold">{conversationState.chunks.length}</div>
              <div className="text-xs text-muted-foreground">Chunks</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-lg font-semibold">
                {conversationState.fullTranscript.split(' ').length}
              </div>
              <div className="text-xs text-muted-foreground">Words</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-lg font-semibold">{conversationState.totalChanges}</div>
              <div className="text-xs text-muted-foreground">Changes</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-lg font-semibold">
                {conversationState.lastUpdated 
                  ? new Date(conversationState.lastUpdated).toLocaleTimeString()
                  : '--:--'
                }
              </div>
              <div className="text-xs text-muted-foreground">Last Update</div>
            </div>
          </div>
        )}

        {/* Current Speech Input */}
        {currentTranscript && isListening && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mic className="h-4 w-4 text-blue-400" />
              Current Speech
            </label>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm max-h-24 overflow-y-auto">
              {currentTranscript}
            </div>
          </div>
        )}

        {/* Full Conversation Transcript */}
        {conversationState.fullTranscript && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-400" />
              Conversation History
            </label>
            <div className="p-4 bg-muted rounded-lg text-sm max-h-32 overflow-y-auto">
              {conversationState.fullTranscript}
            </div>
          </div>
        )}

        {/* Latest Business Model Changes */}
        {lastChanges.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-400" />
                Latest Changes ({lastChanges.length})
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChangesDetail(!showChangesDetail)}
              >
                {showChangesDetail ? 'Hide' : 'Show'} Details
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {lastChanges.map((change, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={cn("justify-start gap-1", getOperationColor(change.operation))}
                >
                  {getChangeTypeIcon(change.changeType)}
                  {change.operation} {change.changeType}
                </Badge>
              ))}
            </div>

            {showChangesDetail && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {lastChanges.map((change, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      {getChangeTypeIcon(change.changeType)}
                      <span className="font-medium capitalize">
                        {change.operation} {change.changeType}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(change.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs mb-1">
                      {change.reasoning}
                    </p>
                    {change.data && (
                      <div className="text-xs font-mono bg-background p-2 rounded">
                        {change.changeType === 'step' ? (
                          `${change.data.actor} > ${change.data.action} > ${change.data.resource}`
                        ) : (
                          change.data.name || JSON.stringify(change.data, null, 2).slice(0, 100)
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Processing Indicator */}
        {conversationState.isProcessing && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Brain className="h-4 w-4 animate-spin" />
            Analyzing conversation for business model changes...
            <Progress value={66} className="w-32 h-2" />
          </div>
        )}

        {/* Error Display */}
        {speechError && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {speechError}
            </AlertDescription>
          </Alert>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2 flex-wrap justify-center">
          {!isListening ? (
            <Button
              onClick={startConversationCapture}
              disabled={disabled}
              className="gap-2"
            >
              <Mic className="h-4 w-4" />
              Start Conversation
            </Button>
          ) : (
            <Button
              onClick={stopConversationCapture}
              variant="destructive"
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop & Analyze
            </Button>
          )}
          
          {conversationState.chunks.length > 0 && (
            <>
              <Button
                onClick={forceAnalysis}
                variant="outline"
                disabled={conversationState.isProcessing}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Force Analysis
              </Button>
              
              <Button
                onClick={clearConversation}
                variant="outline"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </>
          )}
        </div>

        {/* Session Info */}
        <div className="text-center text-xs text-muted-foreground">
          Session: {conversationState.sessionId.slice(-8)}
        </div>
      </div>
    </Card>
  )
}