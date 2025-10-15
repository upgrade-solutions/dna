"use client"

import { BusinessModelViewer } from '@/components/business-model-viewer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, ArrowDown } from 'lucide-react'
import { useState } from 'react'

export default function SlidingAnimationDemo() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [lastInserted, setLastInserted] = useState<{workflow: string, position: number} | null>(null)

  const handleStepInsert = (workflowId: string, position: number, step: any) => {
    console.log('Step inserted:', { workflowId, position, step })
    setLastInserted({ workflow: workflowId, position })
    
    // Trigger a refresh to show the updated data
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1)
    }, 350) // Slight delay to let animation complete
  }

  const handleStepClick = (step: any) => {
    console.log('Step clicked:', step)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-primary" />
              Sliding Animation Demo
              <Badge variant="secondary">Interactive</Badge>
            </CardTitle>
            <CardDescription>
              Watch items smoothly slide down when new steps are inserted in the middle of workflows.
              Hover over workflow sections to reveal insert buttons.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">How it works:</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Hover over workflow areas → Click "Insert Step" buttons → Watch existing steps slide down smoothly
              </div>
            </div>
            
            {lastInserted && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-800">
                  ✅ Successfully inserted step at position {lastInserted.position + 1} in workflow
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Model Viewer with Animation */}
        <BusinessModelViewer
          refreshTrigger={refreshTrigger}
          onStepClick={handleStepClick}
          onInsertStep={handleStepInsert}
          className="shadow-lg"
        />

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Animation Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">🎯 Precise Insertion</h4>
                <p className="text-sm text-muted-foreground">
                  Insert new steps at any position in the workflow
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">🌊 Smooth Sliding</h4>
                <p className="text-sm text-muted-foreground">
                  Existing items slide down with CSS transitions
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">⚡ Optimistic Updates</h4>
                <p className="text-sm text-muted-foreground">
                  UI updates immediately, syncs with server after
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}