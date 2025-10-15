"use client"

import { useState, useRef, useCallback } from 'react'

export interface AudioMetadata {
  sessionId: string
  timestamp: string
  duration: number
  source: 'meeting' | 'interview' | 'documentation' | 'other'
  participants?: string[]
  tags?: string[]
}

export interface VoiceCaptureHook {
  isRecording: boolean
  audioBlob: Blob | null
  duration: number
  isSupported: boolean
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearRecording: () => void
  error: string | null
}

export const useVoiceCapture = (): VoiceCaptureHook => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const isSupported = typeof navigator !== 'undefined' && 
    navigator.mediaDevices && 
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined'

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Voice recording is not supported in this browser')
      return
    }

    if (isRecording) return

    try {
      setError(null)
      chunksRef.current = []
      setDuration(0)

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        }
      })

      streamRef.current = stream

      // Check for supported MIME types
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4'
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/wav'
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          console.log(`🎤 Audio chunk collected:`, {
            chunkSize: `${(event.data.size / 1024).toFixed(2)} KB`,
            totalChunks: chunksRef.current.length,
            totalSize: `${(chunksRef.current.reduce((total, chunk) => total + chunk.size, 0) / 1024).toFixed(2)} KB`,
            timestamp: new Date().toISOString()
          })
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        console.log(`🎵 Recording completed, blob created:`, {
          blobSize: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
          blobType: blob.type,
          chunksUsed: chunksRef.current.length,
          mimeType,
          timestamp: new Date().toISOString()
        })
        setAudioBlob(blob)
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setError('Recording failed. Please try again.')
        setIsRecording(false)
      }

      mediaRecorderRef.current = mediaRecorder
      console.log(`🎤 Starting recording with:`, {
        mimeType,
        audioConstraints: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        },
        chunkInterval: '1000ms',
        timestamp: new Date().toISOString()
      })
      
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error('Error accessing microphone:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone access and try again.')
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.')
        } else {
          setError('Failed to access microphone. Please check your device settings.')
        }
      } else {
        setError('An unknown error occurred while trying to access the microphone.')
      }
    }
  }, [isSupported, isRecording])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const clearRecording = useCallback(() => {
    setAudioBlob(null)
    setDuration(0)
    setError(null)
  }, [])

  return {
    isRecording,
    audioBlob,
    duration,
    isSupported,
    startRecording,
    stopRecording,
    clearRecording,
    error
  }
}