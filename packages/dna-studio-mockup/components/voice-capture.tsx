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
  Play, 
  Download, 
  Trash2, 
  AlertCircle,
  Clock,
  FileAudio
} from 'lucide-react'
import { useVoiceCapture, AudioMetadata } from '@/hooks/use-voice-capture'
import { cn } from '@/lib/utils'

interface VoiceCaptureComponentProps {
  onAudioCapture?: (blob: Blob, metadata: AudioMetadata) => void
  onAudioPlay?: (blob: Blob) => void
  onTranscriptionComplete?: (transcription: any) => void
  className?: string
  sessionId?: string
  source?: AudioMetadata['source']
  disabled?: boolean
}

export function VoiceCaptureComponent({
  onAudioCapture,
  onAudioPlay,
  onTranscriptionComplete,
  className,
  sessionId = `session-${Date.now()}`,
  source = 'documentation',
  disabled = false
}: VoiceCaptureComponentProps) {
  const { 
    isRecording, 
    audioBlob, 
    duration, 
    isSupported, 
    startRecording, 
    stopRecording, 
    clearRecording, 
    error 
  } = useVoiceCapture()

  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcription, setTranscription] = useState<any>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Create audio URL when blob is available
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
      
      // Call callback with metadata
      if (onAudioCapture) {
        const metadata: AudioMetadata = {
          sessionId,
          timestamp: new Date().toISOString(),
          duration,
          source,
          tags: ['voice-capture']
        }
        onAudioCapture(audioBlob, metadata)
        
        // Upload to API
        uploadAudio(audioBlob, metadata)
      }

      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [audioBlob, onAudioCapture, sessionId, duration, source])

  const uploadAudio = async (blob: Blob, metadata: AudioMetadata) => {
    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    console.log(`[${uploadId}] 🚀 Starting audio upload:`, {
      blobSize: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
      blobType: blob.type,
      metadata,
      timestamp: new Date().toISOString()
    })
    
    try {
      const formData = new FormData()
      const filename = `recording-${sessionId}.webm`
      formData.append('audio', blob, filename)
      formData.append('metadata', JSON.stringify(metadata))
      
      console.log(`[${uploadId}] 📦 FormData prepared:`, {
        filename,
        metadataString: JSON.stringify(metadata)
      })
      
      console.log(`[${uploadId}] 📤 Sending request to /api/intake/audio...`)
      const startTime = Date.now()
      setIsTranscribing(true)
      
      const response = await fetch('/api/intake/audio', {
        method: 'POST',
        body: formData
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      setIsTranscribing(false)
      
      console.log(`[${uploadId}] 📥 Response received:`, {
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`[${uploadId}] ✅ Audio uploaded successfully:`, result)
        
        // Store transcription result
        if (result.transcription) {
          setTranscription(result.transcription)
          if (onTranscriptionComplete) {
            onTranscriptionComplete(result.transcription)
          }
        }
        
        // Show success notification in UI (optional)
        // You could add a toast notification here
      } else {
        const errorText = await response.text()
        console.error(`[${uploadId}] ❌ Failed to upload audio:`, {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        })
      }
    } catch (error) {
      console.error(`[${uploadId}] 💥 Error uploading audio:`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })
      setIsTranscribing(false)
    }
  }

  const handlePlayAudio = () => {
    if (audioBlob && onAudioPlay) {
      onAudioPlay(audioBlob)
    } else if (audioUrl) {
      const audio = new Audio(audioUrl)
      setIsPlaying(true)
      audio.play()
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => setIsPlaying(false)
    }
  }

  const handleDownloadAudio = () => {
    if (audioUrl && audioBlob) {
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = `recording-${sessionId}-${Date.now()}.webm`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleClearRecording = () => {
    clearRecording()
    setAudioUrl(null)
    setIsPlaying(false)
    setTranscription(null)
    setIsTranscribing(false)
  }

  if (!isSupported) {
    return (
      <Card className={cn("p-6 bg-card border-border", className)}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Voice recording is not supported in this browser. Please use a modern browser with microphone support.
          </AlertDescription>
        </Alert>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6 bg-card border-border", className)}>
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Recording Indicator */}
        <div className={cn(
          "h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300",
          isRecording 
            ? 'bg-red-500/20 border-2 border-red-500/50 animate-pulse' 
            : audioBlob
            ? 'bg-emerald-500/20 border-2 border-emerald-500/50'
            : 'bg-blue-500/10 border-2 border-blue-500/30'
        )}>
          {isRecording ? (
            <Mic className="h-8 w-8 text-red-400" />
          ) : audioBlob ? (
            <FileAudio className="h-8 w-8 text-emerald-400" />
          ) : (
            <Mic className="h-8 w-8 text-blue-400" />
          )}
        </div>

        {/* Title and Description */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Voice Capture</h3>
          <p className="text-sm text-muted-foreground">
            {isRecording 
              ? 'Recording in progress...'
              : isTranscribing
              ? 'Transcribing audio...'
              : audioBlob
              ? transcription ? 'Recording completed & transcribed' : 'Recording completed'
              : 'Record audio for DNA processing'
            }
          </p>
        </div>

        {/* Duration Display */}
        {(isRecording || audioBlob) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(duration)}</span>
          </div>
        )}

        {/* Recording Progress */}
        {isRecording && (
          <div className="w-full max-w-xs">
            <Progress 
              value={(duration % 60) * (100 / 60)} 
              className="h-2"
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Transcription Display */}
        {transcription && (
          <div className="w-full max-w-md">
            <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800">
              <FileAudio className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium text-emerald-800 dark:text-emerald-200">
                    Transcription Complete
                  </div>
                  <div className="text-sm text-emerald-700 dark:text-emerald-300 italic">
                    "{transcription.text}"
                  </div>
                  {transcription.language && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">
                      Language: {transcription.language} • Duration: {transcription.duration?.toFixed(1)}s
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Transcribing Indicator */}
        {isTranscribing && (
          <div className="w-full max-w-xs">
            <Alert>
              <Clock className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Transcribing audio with OpenAI Whisper...
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2 flex-wrap justify-center">
          {!audioBlob ? (
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              disabled={disabled}
              className="gap-2"
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Start Recording
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePlayAudio}
                variant="outline"
                disabled={isPlaying}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {isPlaying ? 'Playing...' : 'Play'}
              </Button>
              
              <Button
                onClick={handleDownloadAudio}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              
              <Button
                onClick={handleClearRecording}
                variant="outline"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
              
              <Button
                onClick={startRecording}
                variant="default"
                className="gap-2"
                disabled={isTranscribing}
              >
                <Mic className="h-4 w-4" />
                Record Again
              </Button>
            </>
          )}
        </div>

        {/* Audio Quality Badge */}
        {audioBlob && (
          <div className="flex gap-2 flex-wrap justify-center">
            <Badge variant="outline" className="text-xs">
              Quality: {(audioBlob.size / 1024 / 1024).toFixed(1)} MB • {formatDuration(duration)}
            </Badge>
            {transcription && (
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                Transcribed: {transcription.text.length} chars
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}