"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Mic, 
  MicOff, 
  Copy, 
  Trash2, 
  AlertCircle,
  FileText,
  Download
} from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { cn } from '@/lib/utils'

interface LiveTranscriptionProps {
  onTranscriptChange?: (transcript: string) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function LiveTranscription({
  onTranscriptChange,
  className,
  placeholder = "Spoken words will appear here as you talk...",
  disabled = false
}: LiveTranscriptionProps) {
  const { 
    transcript, 
    isListening, 
    isSupported, 
    startListening, 
    stopListening, 
    clearTranscript, 
    error 
  } = useSpeechRecognition()

  const [savedTranscript, setSavedTranscript] = useState('')

  // Notify parent of transcript changes
  useEffect(() => {
    if (onTranscriptChange) {
      onTranscriptChange(transcript)
    }
  }, [transcript, onTranscriptChange])

  const handleCopyTranscript = async () => {
    if (transcript) {
      try {
        await navigator.clipboard.writeText(transcript)
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy transcript:', err)
      }
    }
  }

  const handleSaveTranscript = () => {
    setSavedTranscript(transcript)
    // You could also save to localStorage or send to server
    localStorage.setItem('lastTranscript', transcript)
  }

  const handleDownloadTranscript = () => {
    if (transcript) {
      const blob = new Blob([transcript], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `transcript-${Date.now()}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  if (!isSupported) {
    return (
      <Card className={cn("p-6 bg-card border-border", className)}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Live transcription is not supported in this browser. Please use Chrome, Edge, or Safari for the best experience.
          </AlertDescription>
        </Alert>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6 bg-card border-border", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center",
              isListening 
                ? 'bg-red-500/20 border border-red-500/50' 
                : 'bg-blue-500/10 border border-blue-500/30'
            )}>
              <FileText className={cn(
                "h-4 w-4",
                isListening ? 'text-red-400' : 'text-blue-400'
              )} />
            </div>
            <div>
              <h3 className="font-semibold">Live Transcription</h3>
              <p className="text-xs text-muted-foreground">
                {isListening ? 'Listening...' : 'Click to start transcribing'}
              </p>
            </div>
          </div>
          
          <Badge 
            variant={isListening ? "destructive" : "outline"}
            className="text-xs"
          >
            {isListening ? 'Live' : 'Stopped'}
          </Badge>
        </div>

        {/* Error Display */}
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Transcript Display */}
        <div className="space-y-2">
          <Label htmlFor="transcript">Transcript</Label>
          <Textarea
            id="transcript"
            value={transcript}
            onChange={(e) => {
              // Allow manual editing of transcript
              if (onTranscriptChange) {
                onTranscriptChange(e.target.value)
              }
            }}
            placeholder={placeholder}
            className="min-h-[200px] resize-none"
            disabled={disabled}
          />
          
          {transcript && (
            <div className="text-xs text-muted-foreground">
              {transcript.length} characters • ~{Math.ceil(transcript.split(' ').length / 200)} minutes reading time
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            disabled={disabled}
            className="gap-2"
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Start Listening
              </>
            )}
          </Button>

          {transcript && (
            <>
              <Button
                onClick={handleCopyTranscript}
                variant="outline"
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              
              <Button
                onClick={handleDownloadTranscript}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              
              <Button
                onClick={clearTranscript}
                variant="outline"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </>
          )}
        </div>

        {/* Saved Transcript Indicator */}
        {savedTranscript && savedTranscript !== transcript && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              You have a saved transcript. The current transcript has been modified.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  )
}