import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs/promises'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// In-memory conversation store (in production, use Redis or database)
const conversations = new Map<string, ConversationData>()

// Shared global business model data storage
declare global {
  var businessModelData: {
    workflows: any[]
    steps: any[]
    actors: any[]
    resources: any[]
    actions: any[]
    changes: any[]
  } | null
}

// Initialize business model data from files on first request
async function initializeBusinessModelData() {
  if (global.businessModelData) return global.businessModelData
  
  try {
    const dataDir = path.join(process.cwd(), 'app/api/data')
    
    const [workflows, steps] = await Promise.all([
      fs.readFile(path.join(dataDir, 'workflows.json'), 'utf-8').then(JSON.parse),
      fs.readFile(path.join(dataDir, 'steps.json'), 'utf-8').then(JSON.parse)
    ])

    // Extract unique actors, actions, and resources from steps
    const actors = [...new Set(steps.map((s: any) => s.actor as string))]
      .filter((actor): actor is string => typeof actor === 'string')
      .map((actor: string) => ({
        id: actor.toLowerCase().replace(/\s+/g, '-'),
        name: actor,
        type: actor.toLowerCase().includes('system') ? 'system' : 'person'
      }))

    const actions = [...new Set(steps.map((s: any) => s.action as string))]
      .filter((action): action is string => typeof action === 'string')
      .map((action: string) => ({
        id: action.toLowerCase().replace(/\s+/g, '-'),
        name: action,
        category: 'process'
      }))

    const resources = [...new Set(steps.map((s: any) => s.resource as string))]
      .filter((resource): resource is string => typeof resource === 'string')
      .map((resource: string) => ({
        id: resource.toLowerCase().replace(/\s+/g, '-'),
        name: resource,
        type: 'document'
      }))
    
    global.businessModelData = {
      workflows,
      steps,
      actors,
      actions,
      resources,
      changes: []
    }
    
    return global.businessModelData
  } catch (error) {
    console.error('Error initializing business model data:', error)
    global.businessModelData = {
      workflows: [],
      steps: [],
      actors: [],
      actions: [],
      resources: [],
      changes: []
    }
    return global.businessModelData
  }
}

interface TranscriptChunk {
  timestamp: string
  transcript: string
  chunkIndex: number
}

interface BusinessModelChange {
  timestamp: string
  changeType: 'workflow' | 'step' | 'actor' | 'resource' | 'action'
  operation: 'create' | 'update' | 'delete'
  data: any
  confidence: number
}

interface ConversationData {
  id: string
  sessionId: string
  chunks: TranscriptChunk[]
  fullTranscript: string
  lastUpdated: string
  businessModelChanges: BusinessModelChange[]
}

interface BusinessModelData {
  workflows: any[]
  steps: any[]
  actors: any[]
  resources: any[]
  actions: any[]
}

export async function POST(request: NextRequest) {
  const requestId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
  console.log(`[${requestId}] Processing conversation update`)
  
  try {
    const { 
      sessionId, 
      transcriptChunk, 
      chunkIndex = 0,
      forceAnalysis = false 
    } = await request.json()

    if (!sessionId || !transcriptChunk) {
      return NextResponse.json(
        { error: 'sessionId and transcriptChunk are required' },
        { status: 400 }
      )
    }

    // Get or create conversation
    let conversation: ConversationData = conversations.get(sessionId) || {
      id: sessionId,
      sessionId,
      chunks: [],
      fullTranscript: '',
      lastUpdated: new Date().toISOString(),
      businessModelChanges: []
    }

    // Check for duplicate transcript content to prevent repetition
    const normalizedChunk = transcriptChunk.trim().replace(/\s+/g, ' ')
    const isDuplicate = conversation.chunks.some(chunk => 
      chunk.transcript.trim().replace(/\s+/g, ' ') === normalizedChunk
    )
    
    if (!isDuplicate && normalizedChunk.length > 0) {
      // Add new transcript chunk only if it's not a duplicate
      const newChunk: TranscriptChunk = {
        timestamp: new Date().toISOString(),
        transcript: transcriptChunk,
        chunkIndex
      }
      
      conversation.chunks.push(newChunk)
      conversation.fullTranscript = conversation.chunks
        .map(chunk => chunk.transcript)
        .join(' ')
        .replace(/\s+/g, ' ') // Clean up extra spaces
        .trim()
      console.log(`[${requestId}] Added new unique chunk (${conversation.chunks.length} total)`)
    } else {
      console.log(`[${requestId}] Skipped duplicate transcript chunk`)
    }
    conversation.lastUpdated = new Date().toISOString()

    // Store updated conversation
    conversations.set(sessionId, conversation)

    // Decide whether to analyze (every 3 chunks or on force)
    const shouldAnalyze = forceAnalysis || 
      conversation.chunks.length % 3 === 0 || 
      transcriptChunk.toLowerCase().includes('done') ||
      transcriptChunk.toLowerCase().includes('complete')

    let businessModelChanges = null
    
    if (shouldAnalyze) {
      console.log(`[${requestId}] Analyzing conversation for business model updates`)
      businessModelChanges = await analyzeConversationForBusinessModelChanges(
        conversation, 
        requestId
      )
      
      if (businessModelChanges && businessModelChanges.length > 0) {
        // Filter out duplicate business model changes
        const uniqueChanges = businessModelChanges.filter(newChange => {
          return !conversation.businessModelChanges.some(existingChange => 
            existingChange.changeType === newChange.changeType &&
            existingChange.operation === newChange.operation &&
            JSON.stringify(existingChange.data) === JSON.stringify(newChange.data)
          )
        })
        
        if (uniqueChanges.length > 0) {
          conversation.businessModelChanges.push(...uniqueChanges)
          await applyBusinessModelChanges(uniqueChanges, requestId)
          console.log(`[${requestId}] Applied ${uniqueChanges.length} unique changes (${businessModelChanges.length - uniqueChanges.length} duplicates filtered)`)
        } else {
          console.log(`[${requestId}] All ${businessModelChanges.length} changes were duplicates, skipped`)
        }
      }
    }

    return NextResponse.json({
      conversationId: sessionId,
      chunkIndex,
      totalChunks: conversation.chunks.length,
      fullTranscriptLength: conversation.fullTranscript.length,
      analyzed: shouldAnalyze,
      businessModelChanges: businessModelChanges || [],
      totalChanges: conversation.businessModelChanges.length,
      lastUpdated: conversation.lastUpdated
    })

  } catch (error) {
    console.error(`[${requestId}] Error processing conversation:`, error)
    return NextResponse.json(
      { 
        error: 'Failed to process conversation',
        requestId
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
  }

  const conversation = conversations.get(sessionId)
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  return NextResponse.json(conversation)
}

async function analyzeConversationForBusinessModelChanges(
  conversation: ConversationData, 
  requestId: string
): Promise<any[]> {
  try {
    // Load current business model data
    await initializeBusinessModelData()
    if (!global.businessModelData) return []
    
    const prompt = `You are a business process expert analyzing a conversation to identify changes needed in a business model.

CURRENT BUSINESS MODEL:
Workflows: ${JSON.stringify(global.businessModelData.workflows, null, 2)}
Steps: ${JSON.stringify(global.businessModelData.steps, null, 2)}

CONVERSATION TRANSCRIPT:
"${conversation.fullTranscript}"

IMPORTANT: AVOID DUPLICATE CHANGES
- Only suggest changes that are genuinely NEW and not already represented in the current model
- If a similar step, actor, action, or resource already exists, DO NOT suggest creating it again
- Focus on identifying MISSING elements or MODIFICATIONS to existing elements
- Pay close attention to existing step sequences and avoid suggesting duplicate steps

TASK: Analyze the transcript and identify specific changes needed to the business model using the Actor > Action > Resource pattern.

Each step follows this structure:
- actor: Who performs the action (person, role, or system)
- action: What operation is performed (verb: submit, verify, process, etc.)
- resource: What is being acted upon (document, data, system, etc.)
- order: Position in the workflow sequence (important for proper ordering)

When creating new steps, especially when the user mentions inserting "between" existing steps:
- Determine the correct order number based on the context
- For insertion between step N and N+1, use order N+0.5 (the system will handle reordering)
- Pay attention to phrases like "after step X", "between X and Y", "before step Y"
- VERIFY that the suggested step doesn't already exist in the workflow

Return a JSON object with a "changes" array containing change objects:
{
  "changes": [
    {
      "changeType": "workflow" | "step" | "actor" | "resource" | "action",
      "operation": "create" | "update" | "delete",
      "confidence": 0.0-1.0,
      "reasoning": "why this change is needed AND why it's not a duplicate",
      "data": {
        // For workflows: { "name": "...", "description": "...", "productId": "..." }
        // For steps: { "actor": "...", "action": "...", "resource": "...", "workflowId": "...", "order": number, "description": "..." }
        // For actors: { "name": "...", "type": "...", "description": "..." }
        // For resources: { "name": "...", "type": "...", "description": "..." }
        // For actions: { "name": "...", "description": "...", "category": "..." }
      },
      "relatedExisting": "id of existing item if updating/deleting"
    }
  ]
}

RULES:
1. Only suggest changes that are clearly mentioned or implied in the transcript
2. Maintain the Actor > Action > Resource pattern for all steps
3. Use high confidence (0.8+) only for explicitly mentioned items
4. Use medium confidence (0.5-0.7) for strongly implied items
5. Don't suggest changes for vague or unclear references
6. Focus on actionable, specific changes
7. Ensure actors are specific roles or systems, not generic terms
8. Actions should be clear verbs that represent actual operations
9. Resources should be concrete entities (documents, systems, data, etc.)
10. CRITICAL: Check existing model carefully to avoid suggesting duplicates
11. If the same concept is mentioned multiple times in the transcript, only suggest it ONCE

Examples of good Actor > Action > Resource combinations:
- "Loan Officer" > "Reviews" > "Credit Application"
- "System" > "Validates" > "Customer Data"
- "Customer" > "Submits" > "Payment Request"
- "Underwriter" > "Approves" > "Loan Application"

Return only the JSON object, no additional text.`

    let completion
    try {
      // Try with JSON format first (gpt-4o, gpt-4-turbo)
      completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2
      })
    } catch (formatError) {
      console.log(`[${requestId}] JSON format not supported, trying without format constraint`)
      // Fallback to regular completion without JSON format
      completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      })
    }

    const responseContent = completion.choices[0].message.content || '{}'
    
    // Try to extract JSON from response (in case it's wrapped in markdown)
    let jsonContent = responseContent
    const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonContent = jsonMatch[1]
    } else if (responseContent.includes('{') && responseContent.includes('}')) {
      // Extract JSON object from the response
      const startIndex = responseContent.indexOf('{')
      const endIndex = responseContent.lastIndexOf('}') + 1
      jsonContent = responseContent.slice(startIndex, endIndex)
    }
    
    const result = JSON.parse(jsonContent)
    
    // Handle different possible response structures
    const changes = result.changes || result || []
    
    console.log(`[${requestId}] Identified ${changes.length} potential business model changes`)
    return changes.map((change: any) => ({
      ...change,
      timestamp: new Date().toISOString(),
      sessionId: conversation.sessionId
    }))

  } catch (error) {
    console.error(`[${requestId}] Error analyzing conversation:`, error)
    return []
  }
}

async function loadBusinessModelData(): Promise<BusinessModelData> {
  await initializeBusinessModelData()
  return global.businessModelData || {
    workflows: [],
    steps: [],
    actors: [],
    actions: [],
    resources: []
  }
}

async function applyBusinessModelChanges(changes: any[], requestId: string) {
  console.log(`[${requestId}] Applying ${changes.length} business model changes to in-memory data`)
  
  await initializeBusinessModelData()
  if (!global.businessModelData) return

  let hasChanges = false

  for (const change of changes) {
    if (change.confidence < 0.6) {
      console.log(`[${requestId}] Skipping low-confidence change:`, change.reasoning)
      continue
    }

    try {
      switch (change.changeType) {
        case 'workflow':
          if (change.operation === 'create') {
            const newWorkflow = {
              id: `wf${global.businessModelData.workflows.length + 1}`,
              ...change.data,
              status: 'Draft'
            }
            global.businessModelData.workflows.push(newWorkflow)
            hasChanges = true
            console.log(`[${requestId}] Created new workflow:`, newWorkflow.name)
          }
          break

        case 'step':
          if (change.operation === 'create') {
            const workflowId = change.data.workflowId
            
            // Check for existing step with same actor/action/resource in this workflow
            const isDuplicateStep = global.businessModelData.steps.some(existingStep => 
              existingStep.workflowId === workflowId &&
              existingStep.actor === change.data.actor &&
              existingStep.action === change.data.action &&
              existingStep.resource === change.data.resource
            )
            
            if (isDuplicateStep) {
              console.log(`[${requestId}] Skipped duplicate step: ${change.data.actor} > ${change.data.action} > ${change.data.resource}`)
              break
            }
            
            // Get existing steps for this workflow and sort by order
            const workflowSteps = global.businessModelData.steps
              .filter(s => s.workflowId === workflowId)
              .map((step, index) => ({ ...step, order: step.order ?? index + 1 }))
              .sort((a, b) => (a.order || 0) - (b.order || 0))
            
            // Determine the insertion order
            let insertOrder = change.data.order
            if (!insertOrder) {
              // If no order specified, add at the end
              insertOrder = workflowSteps.length + 1
            }
            
            // Handle fractional orders (like 1.5 for inserting between 1 and 2)
            if (insertOrder % 1 !== 0) {
              const targetOrder = Math.floor(insertOrder)
              // Insert between targetOrder and targetOrder + 1
              insertOrder = targetOrder + 1
              
              // Reorder subsequent steps
              global.businessModelData.steps.forEach(step => {
                if (step.workflowId === workflowId && (step.order || 0) >= insertOrder) {
                  step.order = (step.order || 0) + 1
                }
              })
            } else if (insertOrder <= workflowSteps.length) {
              // If inserting at an integer position between existing steps, shift subsequent steps
              global.businessModelData.steps.forEach(step => {
                if (step.workflowId === workflowId && (step.order || 0) >= insertOrder) {
                  step.order = (step.order || 0) + 1
                }
              })
            }
            
            // Create new step with proper ID
            const maxId = Math.max(...global.businessModelData.steps.map(s => parseInt(s.id.replace('s', '')) || 0))
            const newStep = {
              id: `s${maxId + 1}`,
              ...change.data,
              order: insertOrder,
              status: 'Draft'
            }
            
            global.businessModelData.steps.push(newStep)
            hasChanges = true
            console.log(`[${requestId}] Created new step at order ${insertOrder}:`, `${newStep.actor} > ${newStep.action} > ${newStep.resource}`)
            console.log(`[${requestId}] Global steps count after addition:`, global.businessModelData.steps.length)
            console.log(`[${requestId}] Last 3 step IDs:`, global.businessModelData.steps.slice(-3).map(s => s.id))
          } else if (change.operation === 'update' && change.relatedExisting) {
            const stepIndex = global.businessModelData.steps.findIndex(s => s.id === change.relatedExisting)
            if (stepIndex >= 0) {
              global.businessModelData.steps[stepIndex] = { ...global.businessModelData.steps[stepIndex], ...change.data }
              hasChanges = true
              console.log(`[${requestId}] Updated step:`, change.relatedExisting)
            }
          }
          break
      }
    } catch (error) {
      console.error(`[${requestId}] Error applying change:`, error, change)
    }
  }

  // Store changes for tracking but don't save to files
  if (hasChanges) {
    global.businessModelData.changes.push(...changes.map(change => ({
      ...change,
      appliedAt: new Date().toISOString()
    })))
    console.log(`[${requestId}] Business model data updated in memory (${global.businessModelData.changes.length} total changes)`)
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
  }

  conversations.delete(sessionId)
  return NextResponse.json({ success: true, message: 'Conversation deleted' })
}