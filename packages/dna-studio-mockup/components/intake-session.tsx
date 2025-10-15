"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VoiceCaptureComponent } from '@/components/voice-capture'
import { LiveTranscription } from '@/components/live-transcription'
import { 
  Dna,
  ArrowLeft,
  Upload,
  Mic,
  FileText,
  Video,
  Users,
  Calendar,
  Tag,
  Save,
  Send
} from 'lucide-react'
import { AudioMetadata } from '@/hooks/use-voice-capture'

interface IntakeSessionProps {
  onBack?: () => void
  onSave?: (data: IntakeSessionData) => void
  onSubmit?: (data: IntakeSessionData) => void
}

export interface IntakeSessionData {
  sessionId: string
  title: string
  description: string
  source: AudioMetadata['source']
  participants: string[]
  tags: string[]
  audioBlob?: Blob
  transcript: string
  notes: string
  timestamp: string
}

export function IntakeSession({ onBack, onSave, onSubmit }: IntakeSessionProps) {
  const [sessionData, setSessionData] = useState<IntakeSessionData>({
    sessionId: `session-${Date.now()}`,
    title: '',
    description: '',
    source: 'meeting',
    participants: [],
    tags: [],
    transcript: '',
    notes: '',
    timestamp: new Date().toISOString()
  })

  const [participantInput, setParticipantInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [activeTab, setActiveTab] = useState('setup')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processResult, setProcessResult] = useState<any>(null)

  const handleAudioCapture = (blob: Blob, metadata: AudioMetadata) => {
    setSessionData(prev => ({
      ...prev,
      audioBlob: blob,
      timestamp: metadata.timestamp
    }))
    setActiveTab('transcription')
  }

  const handleTranscriptChange = (transcript: string) => {
    setSessionData(prev => ({
      ...prev,
      transcript
    }))
  }

  const handleAddParticipant = () => {
    if (participantInput.trim() && !sessionData.participants.includes(participantInput.trim())) {
      setSessionData(prev => ({
        ...prev,
        participants: [...prev.participants, participantInput.trim()]
      }))
      setParticipantInput('')
    }
  }

  const handleRemoveParticipant = (participant: string) => {
    setSessionData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p !== participant)
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !sessionData.tags.includes(tagInput.trim())) {
      setSessionData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSessionData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleSave = () => {
    if (onSave) {
      onSave(sessionData)
    }
  }

  const handleSubmit = async () => {
    if (!isSessionComplete) return
    
    setIsProcessing(true)
    try {
      const response = await fetch('/api/intake/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionData })
      })
      
      if (response.ok) {
        const result = await response.json()
        setProcessResult(result)
        if (onSubmit) {
          onSubmit(sessionData)
        }
        // You could redirect to results page or show success message
        console.log('DNA processing completed:', result)
      } else {
        console.error('Failed to process DNA:', response.statusText)
      }
    } catch (error) {
      console.error('Error processing DNA:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const isSessionComplete = sessionData.title && 
    (sessionData.audioBlob || sessionData.transcript) &&
    sessionData.description

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">DNA Studio</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Intake Session
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} variant="outline" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isSessionComplete || isProcessing}
            size="sm" 
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Process DNA'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">New Intake Session</h1>
            <p className="text-muted-foreground">
              Capture and process business requirements for DNA schema generation
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="capture">Capture</TabsTrigger>
              <TabsTrigger value="transcription">Transcription</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            {/* Setup Tab */}
            <TabsContent value="setup" className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Session Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Session Title *</Label>
                    <Input
                      id="title"
                      value={sessionData.title}
                      onChange={(e) => setSessionData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Customer Onboarding Requirements Review"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={sessionData.description}
                      onChange={(e) => setSessionData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of what will be discussed..."
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="source">Session Type</Label>
                    <Select
                      value={sessionData.source}
                      onValueChange={(value: AudioMetadata['source']) => 
                        setSessionData(prev => ({ ...prev, source: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Participants</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={participantInput}
                      onChange={(e) => setParticipantInput(e.target.value)}
                      placeholder="Add participant name..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
                    />
                    <Button onClick={handleAddParticipant} className="gap-2">
                      <Users className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                  
                  {sessionData.participants.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {sessionData.participants.map((participant) => (
                        <Badge 
                          key={participant} 
                          variant="secondary" 
                          className="gap-2 cursor-pointer"
                          onClick={() => handleRemoveParticipant(participant)}
                        >
                          {participant}
                          <span className="text-xs">×</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Tags</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tag..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} className="gap-2">
                      <Tag className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                  
                  {sessionData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {sessionData.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="gap-2 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag}
                          <span className="text-xs">×</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setActiveTab('capture')} className="gap-2">
                  Next: Capture Audio
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </TabsContent>

            {/* Capture Tab */}
            <TabsContent value="capture" className="space-y-6">
              <VoiceCaptureComponent
                onAudioCapture={handleAudioCapture}
                sessionId={sessionData.sessionId}
                source={sessionData.source}
              />
              
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Alternative Inputs</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                    <Upload className="h-8 w-8 text-blue-400" />
                    <div>
                      <div className="font-medium">Upload Audio</div>
                      <div className="text-xs text-muted-foreground">Import existing recording</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                    <Video className="h-8 w-8 text-purple-400" />
                    <div>
                      <div className="font-medium">Video Meeting</div>
                      <div className="text-xs text-muted-foreground">Extract from video call</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                    <FileText className="h-8 w-8 text-emerald-400" />
                    <div>
                      <div className="font-medium">Text Import</div>
                      <div className="text-xs text-muted-foreground">Paste or upload text</div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Transcription Tab */}
            <TabsContent value="transcription" className="space-y-6">
              <LiveTranscription
                onTranscriptChange={handleTranscriptChange}
                placeholder="Live transcription will appear here, or you can type/paste content manually..."
              />
              
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Session Notes</h3>
                <Textarea
                  value={sessionData.notes}
                  onChange={(e) => setSessionData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes, context, or observations..."
                  className="min-h-[150px]"
                />
              </Card>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => setActiveTab('review')} 
                  disabled={!sessionData.transcript}
                  className="gap-2"
                >
                  Next: Review Session
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </TabsContent>

            {/* Review Tab */}
            <TabsContent value="review" className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Session Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Title</Label>
                      <p className="font-medium">{sessionData.title || 'Untitled Session'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Type</Label>
                      <Badge variant="outline" className="capitalize">
                        {sessionData.source}
                      </Badge>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Participants</Label>
                      <p className="text-sm">
                        {sessionData.participants.length > 0 
                          ? sessionData.participants.join(', ')
                          : 'No participants added'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Audio</Label>
                      <p className="text-sm">
                        {sessionData.audioBlob 
                          ? `${(sessionData.audioBlob.size / 1024 / 1024).toFixed(1)} MB recording`
                          : 'No audio recorded'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Transcript</Label>
                      <p className="text-sm">
                        {sessionData.transcript 
                          ? `${sessionData.transcript.length} characters`
                          : 'No transcript available'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Tags</Label>
                      <div className="flex flex-wrap gap-1">
                        {sessionData.tags.length > 0 
                          ? sessionData.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))
                          : <span className="text-sm text-muted-foreground">No tags</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Ready for DNA Processing</h3>
                <p className="text-muted-foreground mb-4">
                  This session will be processed to extract workflows, identify actors and actions, 
                  and generate structured DNA schemas.
                </p>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={handleSubmit}
                    disabled={!isSessionComplete || isProcessing}
                    size="lg" 
                    className="gap-2"
                  >
                    <Dna className="h-4 w-4" />
                    {isProcessing ? 'Processing DNA...' : 'Process with DNA'}
                  </Button>
                  
                  <Button onClick={handleSave} variant="outline" size="lg" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save for Later
                  </Button>
                </div>
                
                {processResult && (
                  <Card className="p-4 bg-emerald-50 border-emerald-200 mt-4">
                    <h4 className="font-semibold text-emerald-800 mb-2">DNA Processing Complete!</h4>
                    <p className="text-sm text-emerald-700">
                      Extracted {processResult.extractedWorkflows?.length || 0} workflows with 
                      {processResult.confidence * 100}% confidence.
                    </p>
                  </Card>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}