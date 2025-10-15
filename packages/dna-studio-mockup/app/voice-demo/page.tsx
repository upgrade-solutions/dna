"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { VoiceCaptureComponent } from '@/components/voice-capture'
import { LiveTranscription } from '@/components/live-transcription'
import { 
  Dna,
  ArrowLeft,
  Mic,
  FileText,
  Sparkles
} from 'lucide-react'
import { AudioMetadata } from '@/hooks/use-voice-capture'

export default function VoiceDemoPage() {
  const [capturedAudio, setCapturedAudio] = useState<Blob | null>(null)
  const [transcript, setTranscript] = useState('')

  const handleAudioCapture = (blob: Blob, metadata: AudioMetadata) => {
    setCapturedAudio(blob)
    console.log('Audio captured:', { size: blob.size, metadata })
  }

  const handleTranscriptChange = (newTranscript: string) => {
    setTranscript(newTranscript)
  }

  const handleBack = () => {
    window.location.href = '/'
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">DNA Studio</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Voice Capture Demo
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => window.location.href = '/intake'} variant="outline" size="sm" className="gap-2">
            <Mic className="h-4 w-4" />
            Full Intake
          </Button>
          <Button onClick={() => window.location.href = '/studio'} variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            DNA Studio
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Voice Capture Demo</h1>
            <p className="text-muted-foreground">
              Test the voice recording and live transcription features for DNA processing
            </p>
          </div>

          <div className="space-y-8">
            {/* Voice Capture Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Mic className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Voice Recording</h2>
              </div>
              <VoiceCaptureComponent
                onAudioCapture={handleAudioCapture}
                sessionId="demo-session"
                source="documentation"
              />
            </section>

            {/* Live Transcription Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Live Transcription</h2>
              </div>
              <LiveTranscription
                onTranscriptChange={handleTranscriptChange}
                placeholder="Start speaking to see live transcription..."
              />
            </section>

            {/* Status Display */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Capture Status</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Audio Recording</h3>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${
                      capturedAudio ? 'bg-emerald-400' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm text-muted-foreground">
                      {capturedAudio 
                        ? `Audio captured (${(capturedAudio.size / 1024 / 1024).toFixed(1)} MB)`
                        : 'No audio recorded'
                      }
                    </span>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Transcript</h3>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${
                      transcript ? 'bg-emerald-400' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm text-muted-foreground">
                      {transcript 
                        ? `${transcript.length} characters transcribed`
                        : 'No transcript available'
                      }
                    </span>
                  </div>
                </Card>
              </div>
            </section>

            {/* Instructions */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold mb-3 text-blue-800">How to Test</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                <li>Click "Start Recording" to begin voice capture</li>
                <li>Speak clearly about business processes or requirements</li>
                <li>Click "Stop Recording" when finished</li>
                <li>Try the live transcription feature for real-time text conversion</li>
                <li>Both captured audio and transcript will be processed for DNA extraction</li>
              </ol>
            </Card>

            {/* Sample Content Suggestion */}
            <Card className="p-6 bg-emerald-50 border-emerald-200">
              <h3 className="font-semibold mb-3 text-emerald-800">Sample Content to Record</h3>
              <div className="text-sm text-emerald-700 space-y-2">
                <p>Try recording this sample business process:</p>
                <blockquote className="italic border-l-4 border-emerald-300 pl-4">
                  "When a customer wants to apply for a loan, they first fill out an application form with their personal details and income information. Then the system checks their credit score automatically. After that, a loan officer reviews the application and verifies the provided documents. If everything looks good, the risk assessment system evaluates the application and either approves or denies the loan request."
                </blockquote>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}