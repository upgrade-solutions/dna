import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper function to transcribe audio using OpenAI Whisper
const transcribeAudio = async (audioFile: File, requestId: string) => {
  try {
    console.log(`[${requestId}] 🎯 Starting OpenAI transcription...`)
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'gpt-4o-mini-transcribe',
      language: 'en', // Optional: specify language, or let Whisper auto-detect
      response_format: 'json', // Use 'json' format as 'verbose_json' is not supported
      temperature: 0.2, // Lower temperature for more consistent results
    })
    
    console.log(`[${requestId}] ✅ Transcription completed:`, {
      text: transcription.text.substring(0, 100) + (transcription.text.length > 100 ? '...' : ''),
      textLength: transcription.text.length
    })
    
    return transcription
  } catch (error) {
    console.error(`[${requestId}] 💥 Transcription error:`, {
      error: error instanceof Error ? error.message : String(error),
      type: error instanceof Error ? error.constructor.name : 'Unknown'
    })
    throw error
  }
}

export async function POST(request: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
  console.log(`[${requestId}] 🎤 Audio intake request received at ${new Date().toISOString()}`)
  
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as File
    const metadata = formData.get('metadata') as string

    console.log(`[${requestId}] 📄 Form data parsed:`, {
      hasAudio: !!audio,
      audioSize: audio?.size || 0,
      audioType: audio?.type || 'unknown',
      audioName: audio?.name || 'unknown',
      hasMetadata: !!metadata
    })

    if (!audio) {
      console.log(`[${requestId}] ❌ No audio file provided`)
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Parse metadata
    const audioMetadata = metadata ? JSON.parse(metadata) : {}
    console.log(`[${requestId}] 📊 Audio metadata:`, audioMetadata)
    
    // Log audio file details
    console.log(`[${requestId}] 🎵 Audio file details:`, {
      size: `${(audio.size / 1024 / 1024).toFixed(2)} MB`,
      type: audio.type,
      name: audio.name,
      lastModified: audio.lastModified ? new Date(audio.lastModified).toISOString() : 'unknown'
    })

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log(`[${requestId}] ⚠️ OpenAI API key not configured, skipping transcription`)
    }

    let transcriptionResult = null
    let transcriptionError = null

    // Perform transcription if OpenAI is configured
    if (process.env.OPENAI_API_KEY) {
      try {
        transcriptionResult = await transcribeAudio(audio, requestId)
      } catch (error) {
        transcriptionError = error instanceof Error ? error.message : String(error)
        console.log(`[${requestId}] ⚠️ Transcription failed, continuing without it:`, transcriptionError)
      }
    }

    // Send transcription to conversation API for business model analysis
    let conversationResult = null
    if (transcriptionResult?.text) {
      try {
        console.log(`[${requestId}] Sending transcription to conversation API...`)
        const conversationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/intake/conversation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: audioMetadata.sessionId || `audio-session-${Date.now()}`,
            transcriptChunk: transcriptionResult.text,
            chunkIndex: audioMetadata.chunkIndex || 0,
            forceAnalysis: true // Force analysis for uploaded audio
          })
        })
        
        if (conversationResponse.ok) {
          conversationResult = await conversationResponse.json()
          console.log(`[${requestId}] Conversation analysis completed:`, {
            totalChanges: conversationResult.totalChanges,
            businessModelChanges: conversationResult.businessModelChanges?.length || 0
          })
        }
      } catch (convError) {
        console.log(`[${requestId}] ⚠️ Conversation analysis failed:`, convError instanceof Error ? convError.message : String(convError))
      }
    }

    // Prepare response with transcription and business model analysis
    const response = {
      audioId: `audio-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      size: audio.size,
      type: audio.type,
      metadata: audioMetadata,
      status: 'uploaded',
      transcriptionStatus: transcriptionResult ? 'completed' : transcriptionError ? 'failed' : 'skipped',
      transcription: transcriptionResult ? {
        text: transcriptionResult.text
      } : null,
      transcriptionError,
      conversationAnalysis: conversationResult ? {
        totalChanges: conversationResult.totalChanges,
        businessModelChanges: conversationResult.businessModelChanges || [],
        conversationId: conversationResult.conversationId
      } : null,
      requestId // Add request ID for tracking
    }

    console.log(`[${requestId}] ✅ Processing successful, response prepared:`, {
      ...response,
      transcription: response.transcription ? {
        text: response.transcription.text.substring(0, 100) + (response.transcription.text.length > 100 ? '...' : '')
      } : null
    })

    // Simulate some processing time (removed since we now do real transcription)
    console.log(`[${requestId}] 🚀 Sending response to client`)
    return NextResponse.json(response)
  } catch (error) {
    console.error(`[${requestId}] 💥 Error processing audio upload:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { 
        error: 'Failed to process audio upload',
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return list of uploaded audio files
  return NextResponse.json({
    message: 'Audio intake API endpoint',
    endpoints: {
      POST: 'Upload audio file with metadata',
      GET: 'List uploaded audio files'
    }
  })
}