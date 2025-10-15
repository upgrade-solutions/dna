"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'

export interface ConversationChunk {
  timestamp: string
  transcript: string
  chunkIndex: number
}

export interface BusinessModelChange {
  timestamp: string
  changeType: 'workflow' | 'step' | 'actor' | 'resource' | 'action'
  operation: 'create' | 'update' | 'delete'
  data: any
  confidence: number
  reasoning: string
  relatedExisting?: string
}

export interface ConversationState {
  sessionId: string
  chunks: ConversationChunk[]
  fullTranscript: string
  isProcessing: boolean
  businessModelChanges: BusinessModelChange[]
  totalChanges: number
  lastUpdated: string | null
}

export interface UseConversationOptions {
  sessionId?: string
  autoAnalyzeInterval?: number // Analyze every N chunks
  onBusinessModelChange?: (changes: BusinessModelChange[]) => void
  onBusinessModelUpdate?: () => void // Called when changes are applied
  onError?: (error: string) => void
}

export function useConversationCapture({
  sessionId = `session-${Date.now()}`,
  autoAnalyzeInterval = 3,
  onBusinessModelChange,
  onBusinessModelUpdate,
  onError
}: UseConversationOptions = {}) {
  const [conversationState, setConversationState] = useState<ConversationState>({
    sessionId,
    chunks: [],
    fullTranscript: '',
    isProcessing: false,
    businessModelChanges: [],
    totalChanges: 0,
    lastUpdated: null
  })

  const chunkIndexRef = useRef(0)
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSentTranscriptRef = useRef('')
  const isProcessingRef = useRef(false)

  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
    error: speechError
  } = useSpeechRecognition()

  // Send transcript chunk to conversation API
  const sendTranscriptChunk = useCallback(async (
    transcriptText: string, 
    forceAnalysis = false
  ) => {
    const normalizedText = transcriptText.trim().replace(/\s+/g, ' ')
    
    if (!normalizedText) return
    
    // Prevent duplicate submissions
    if (normalizedText === lastSentTranscriptRef.current && !forceAnalysis) {
      console.log('[ConversationCapture] Skipping duplicate transcript submission')
      return
    }
    
    // Prevent overlapping API calls
    if (isProcessingRef.current) {
      console.log('[ConversationCapture] Already processing, skipping submission')
      return
    }
    
    isProcessingRef.current = true
    lastSentTranscriptRef.current = normalizedText
    setConversationState(prev => ({ ...prev, isProcessing: true }))

    try {
      const response = await fetch('/api/intake/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: conversationState.sessionId,
          transcriptChunk: transcriptText,
          chunkIndex: chunkIndexRef.current++,
          forceAnalysis
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      setConversationState(prev => ({
        ...prev,
        chunks: [...prev.chunks, {
          timestamp: new Date().toISOString(),
          transcript: transcriptText,
          chunkIndex: result.chunkIndex
        }],
        fullTranscript: prev.fullTranscript + ' ' + transcriptText,
        isProcessing: false,
        lastUpdated: result.lastUpdated,
        totalChanges: result.totalChanges
      }))
      
      isProcessingRef.current = false

      // Handle business model changes
      if (result.businessModelChanges && result.businessModelChanges.length > 0) {
        setConversationState(prev => ({
          ...prev,
          businessModelChanges: [...prev.businessModelChanges, ...result.businessModelChanges]
        }))

        if (onBusinessModelChange) {
          onBusinessModelChange(result.businessModelChanges)
        }
        
        // Notify that business model has been updated
        if (onBusinessModelUpdate) {
          onBusinessModelUpdate()
        }
      }

    } catch (error) {
      console.error('Error sending transcript chunk:', error)
      isProcessingRef.current = false
      setConversationState(prev => ({ ...prev, isProcessing: false }))
      
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to process transcript')
      }
    }
  }, [conversationState.sessionId, onBusinessModelChange, onError])

  // Debounced processing of speech recognition transcript
  useEffect(() => {
    if (transcript && isListening && !isProcessingRef.current) {
      // Only process if we have meaningful content and aren't already processing
      const normalizedTranscript = transcript.trim().replace(/\s+/g, ' ')
      
      if (normalizedTranscript.length < 10) {
        // Skip very short transcripts to reduce noise
        return
      }
      
      // Clear existing timeout
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current)
      }

      // Set new timeout for debounced processing
      processingTimeoutRef.current = setTimeout(() => {
        // Check again if we're still not processing and content hasn't changed
        if (!isProcessingRef.current && normalizedTranscript !== lastSentTranscriptRef.current) {
          const shouldForceAnalysis = 
            conversationState.chunks.length > 0 && 
            conversationState.chunks.length % autoAnalyzeInterval === 0

          sendTranscriptChunk(transcript, shouldForceAnalysis)
        }
      }, 3000) // Increased to 3 seconds to reduce rapid calls
    }

    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current)
      }
    }
  }, [transcript, isListening, sendTranscriptChunk, conversationState.chunks.length, autoAnalyzeInterval])

  // Start conversation capture
  const startConversationCapture = useCallback(() => {
    setConversationState(prev => ({
      ...prev,
      chunks: [],
      fullTranscript: '',
      businessModelChanges: [],
      totalChanges: 0,
      lastUpdated: null
    }))
    chunkIndexRef.current = 0
    lastSentTranscriptRef.current = ''
    isProcessingRef.current = false
    clearTranscript()
    startListening()
  }, [clearTranscript, startListening])

  // Stop conversation capture and force final analysis
  const stopConversationCapture = useCallback(async () => {
    stopListening()
    
    // Process any remaining transcript
    if (transcript.trim()) {
      await sendTranscriptChunk(transcript, true) // Force analysis on stop
    }
    
    // Clear transcript after processing
    clearTranscript()
  }, [stopListening, transcript, sendTranscriptChunk, clearTranscript])

  // Clear conversation
  const clearConversation = useCallback(async () => {
    try {
      // Delete conversation from server
      await fetch(`/api/intake/conversation?sessionId=${conversationState.sessionId}`, {
        method: 'DELETE'
      })
      
      // Reset local state
      setConversationState(prev => ({
        ...prev,
        chunks: [],
        fullTranscript: '',
        businessModelChanges: [],
        totalChanges: 0,
        lastUpdated: null
      }))
      chunkIndexRef.current = 0
      lastSentTranscriptRef.current = ''
      isProcessingRef.current = false
      clearTranscript()
      stopListening()
    } catch (error) {
      console.error('Error clearing conversation:', error)
    }
  }, [conversationState.sessionId, clearTranscript, stopListening])

  // Get conversation data from server
  const refreshConversation = useCallback(async () => {
    try {
      const response = await fetch(`/api/intake/conversation?sessionId=${conversationState.sessionId}`)
      
      if (response.ok) {
        const data = await response.json()
        setConversationState(prev => ({
          ...prev,
          chunks: data.chunks || [],
          fullTranscript: data.fullTranscript || '',
          businessModelChanges: data.businessModelChanges || [],
          totalChanges: data.businessModelChanges?.length || 0,
          lastUpdated: data.lastUpdated
        }))
      }
    } catch (error) {
      console.error('Error refreshing conversation:', error)
    }
  }, [conversationState.sessionId])

  // Force analysis of current conversation
  const forceAnalysis = useCallback(async () => {
    if (conversationState.fullTranscript.trim()) {
      await sendTranscriptChunk(conversationState.fullTranscript, true)
    }
  }, [conversationState.fullTranscript, sendTranscriptChunk])

  return {
    // State
    conversationState,
    isListening,
    isSupported,
    currentTranscript: transcript,
    speechError,
    
    // Actions
    startConversationCapture,
    stopConversationCapture,
    clearConversation,
    refreshConversation,
    forceAnalysis,
    
    // Manual transcript sending (for non-voice input)
    sendTranscriptChunk: (text: string, forceAnalysis?: boolean) => 
      sendTranscriptChunk(text, forceAnalysis || false)
  }
}