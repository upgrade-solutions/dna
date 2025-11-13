"use client"

import { useState, useEffect } from "react"
import { 
  Globe,
  Building2,
  Database, 
  GitBranch, 
  Zap,
  Palette,
  ChevronUp,
  ChevronDown,
  Hammer,
  Play
} from "lucide-react"
import { Hero } from "@/components/layout/hero"
import { SystemBlueprintSection } from "@/components/system/system-blueprint-section"
import { StructureBlueprintSection } from "@/components/structure/structure-blueprint-section"
import { SchemaBlueprintSection } from "@/components/schema/schema-blueprint-section"
import { StateBlueprintSection } from "@/components/state/state-blueprint-section"
import { SignalBlueprintSection } from "@/components/signal/signal-blueprint-section"
import { StyleBlueprintSection } from "@/components/style/style-blueprint-section"
import { UILayersBlueprintSection } from "@/components/ui-layers/ui-layers-blueprint-section"
import { APILayersBlueprintSection } from "@/components/api-layers/api-layers-blueprint-section"
import { Footer } from "@/components/layout/footer"

// Framework Layers: shared across all phases
const FRAMEWORK_LAYERS = [
  { title: 'System', id: 'system', icon: Globe, description: 'Complete Composition', subtitle: 'The project as a whole organism and ecosystem' },
  { title: 'Structure', id: 'structure', icon: Building2, description: 'Architecture', subtitle: 'Components, modules, and their connections' },
  { title: 'Schema', id: 'schema', icon: Database, description: 'Data & Configuration', subtitle: 'Data models, definitions, and actual content' },
  { title: 'State', id: 'state', icon: GitBranch, description: 'Dynamic Behavior', subtitle: 'How things change over time' },
  { title: 'Signal', id: 'signal', icon: Zap, description: 'Communication Layer', subtitle: 'Events, triggers, and reactions' },
  { title: 'Style', id: 'style', icon: Palette, description: 'Expression & Identity', subtitle: 'Look, feel, and outward behavior' }
]

// Define menu items for Design, Build, Run phases
const DESIGN_ITEMS = [
  { title: 'System', id: 'design-system', layer: 'system', icon: Globe, description: 'Define the system boundary, purpose, and context' },
  { title: 'Structure', id: 'design-structure', layer: 'structure', icon: Building2, description: 'Create blueprints and diagrams of how elements fit together' },
  { title: 'Schema', id: 'design-schema', layer: 'schema', icon: Database, description: 'Define data models, fields, and validation logic' },
  { title: 'State', id: 'design-state', layer: 'state', icon: GitBranch, description: 'Define possible states, transitions, and workflows' },
  { title: 'Signal', id: 'design-signal', layer: 'signal', icon: Zap, description: 'Model event flows, publishers, subscribers, and triggers' },
  { title: 'Style', id: 'design-style', layer: 'style', icon: Palette, description: 'Define visual, interaction, and thematic rules' }
]

const BUILD_ITEMS = [
  { title: 'System', id: 'build-system', layer: 'system', icon: Globe, description: 'Assemble components and integrate dependencies' },
  { title: 'Structure', id: 'build-structure', layer: 'structure', icon: Building2, description: 'Construct elements, provision resources, deploy infrastructure' },
  { title: 'Schema', id: 'build-schema', layer: 'schema', icon: Database, description: 'Generate schemas, migrations, and API contracts' },
  { title: 'State', id: 'build-state', layer: 'state', icon: GitBranch, description: 'Implement state machines, UI transitions, and automation logic' },
  { title: 'Signal', id: 'build-signal', layer: 'signal', icon: Zap, description: 'Implement event buses, listeners, and notification systems' },
  { title: 'Style', id: 'build-style', layer: 'style', icon: Palette, description: 'Implement style guides, component libraries, and consistent UX' }
]

const RUN_ITEMS = [
  { title: 'System', id: 'run-system', layer: 'system', icon: Globe, description: 'Monitor and evolve the system as a living whole' },
  { title: 'Structure', id: 'run-structure', layer: 'structure', icon: Building2, description: 'Track live components, health, and runtime architecture' },
  { title: 'Schema', id: 'run-schema', layer: 'schema', icon: Database, description: 'Observe and manage live data flowing through the system' },
  { title: 'State', id: 'run-state', layer: 'state', icon: GitBranch, description: 'Track actual runtime state and transitions' },
  { title: 'Signal', id: 'run-signal', layer: 'signal', icon: Zap, description: 'Monitor live events, alerts, telemetry, and feedback loops' },
  { title: 'Style', id: 'run-style', layer: 'style', icon: Palette, description: 'Adapt and personalize live presentation and behavior' }
]

// Map detail content based on layer - aligns with framework layers
const LAYER_CONTENT_MAP: { [key: string]: React.ComponentType<{ title?: string; subtitle?: string }> } = {
  // System layer
  'system': SystemBlueprintSection,
  // Structure layer
  'structure': StructureBlueprintSection,
  // Schema layer
  'schema': SchemaBlueprintSection,
  // State layer
  'state': StateBlueprintSection,
  // Signal layer
  'signal': SignalBlueprintSection,
  // Style layer
  'style': StyleBlueprintSection,
}

// Render detail content based on selected layer
const getDetailContent = (itemId: string | null, detailInfo?: any) => {
  if (!itemId) return null
  
  const layer = detailInfo?.layer
  const Component = LAYER_CONTENT_MAP[layer]
  if (!Component) return null
  
  return <Component title={detailInfo?.title} subtitle={detailInfo?.subtitle} />
}

const getDetailInfo = (itemId: string | null, phase: string | null) => {
  if (!itemId || !phase) return null
  
  let allItems: any[] = []
  if (phase === 'design') allItems = DESIGN_ITEMS
  else if (phase === 'build') allItems = BUILD_ITEMS
  else if (phase === 'run') allItems = RUN_ITEMS
  
  return allItems.find((item: any) => item.id === itemId)
}

export default function Home() {
  const [selectedPhase, setSelectedPhase] = useState<string | null>('design')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [selectedDesign, setSelectedDesign] = useState<'ui' | 'api'>('ui')

  const handleItemClick = (item: string) => {
    setSelectedItem(item)
  }

  const handlePhaseClick = (phase: string) => {
    setSelectedPhase(phase)
    setSelectedItem(null)
  }

  // Get current items list based on phase
  const getCurrentItems = () => {
    if (selectedPhase === 'design') return DESIGN_ITEMS
    if (selectedPhase === 'build') return BUILD_ITEMS
    if (selectedPhase === 'run') return RUN_ITEMS
    return []
  }
  
  const currentItems = getCurrentItems()
  
  // Auto-select first item when phase changes
  useEffect(() => {
    if (selectedPhase && !selectedItem) {
      setSelectedItem(currentItems[0]?.id || null)
    }
  }, [selectedPhase])

  // Handle navigation
  const currentIndex = currentItems.findIndex((item: any) => item.id === selectedItem)
  
  const handleNext = () => {
    if (currentIndex < currentItems.length - 1) {
      setSelectedItem(currentItems[currentIndex + 1].id)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSelectedItem(currentItems[currentIndex - 1].id)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, currentItems])

  return (
    <main className="min-h-screen bg-background">
      <Hero />

      {/* Design > Build > Run Layers Demo Section */}
      <section className="py-24 bg-background border-t border-border">
                <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Layered Designs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            See how functionality emerges layer by layer: from structure through schema, state, signal, and style. Toggle layers like Photoshop to see each dimension.
          </p>
        </div>
        {/* UI/API Toggle */}
        <div className="container mx-auto px-4 mb-6">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setSelectedDesign('ui')}
              className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all ${
                selectedDesign === 'ui'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              UI
            </button>
            <button
              onClick={() => setSelectedDesign('api')}
              className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all ${
                selectedDesign === 'api'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              API
            </button>
          </div>
        </div>

        {/* Display selected design */}
        {selectedDesign === 'ui' && <UILayersBlueprintSection />}
        {selectedDesign === 'api' && <APILayersBlueprintSection />}
      </section>
      
      {/* Design/Build/Run Toggle Section */}
      <section className="sticky mt-20 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-6">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => handlePhaseClick('design')}
              className={`px-10 py-4 rounded-lg font-semibold text-lg transition-all flex items-center gap-2 ${
                selectedPhase === 'design'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              <Globe className="h-6 w-6" />
              Design
            </button>
            <button
              onClick={() => handlePhaseClick('build')}
              className={`px-10 py-4 rounded-lg font-semibold text-lg transition-all flex items-center gap-2 ${
                selectedPhase === 'build'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              <Hammer className="h-6 w-6" />
              Build
            </button>
            <button
              onClick={() => handlePhaseClick('run')}
              className={`px-10 py-4 rounded-lg font-semibold text-lg transition-all flex items-center gap-2 ${
                selectedPhase === 'run'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              <Play className="h-6 w-6" />
              Run
            </button>
          </div>
        </div>
      </section>

      {/* Two-Pane Content Section */}
      {selectedPhase && (
        <section className="py-0 bg-background min-h-screen">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 py-4">
              {/* Left Pane: Items List */}
              <div className="lg:col-span-1">
                <div className="bg-muted/30 rounded-lg p-6 border border-border sticky top-24">
                  <h3 className="text-xl font-bold text-foreground mb-6">
                    {selectedPhase === 'design' ? 'Design' : selectedPhase === 'build' ? 'Build' : 'Run'} Layers
                  </h3>
                  <div className="space-y-3">
                    {currentItems.map((item: any) => {
                      const IconComponent = item.icon
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item.id)}
                          className={`w-full text-left px-4 py-4 rounded-lg transition-all flex items-center gap-3 ${
                            selectedItem === item.id
                              ? 'bg-primary text-primary-foreground font-semibold'
                              : 'text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <IconComponent className="h-5 w-5 flex-shrink-0" />
                          <span className="text-base">{item.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Right Pane: Details */}
              <div className="lg:col-span-3">
                {selectedItem ? (
                  <div className="flex flex-col justify-between h-full">
                    {(() => {
                      const detailInfo = getDetailInfo(selectedItem, selectedPhase)
                      const IconComponent = detailInfo?.icon || Globe
                      return (
                        <>
                          <div className="mt-4">
                            {getDetailContent(selectedItem, detailInfo)}
                          </div>

                          {/* Navigation Controls */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                            <button
                              onClick={handlePrevious}
                              disabled={currentIndex === 0}
                              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                currentIndex === 0
                                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                                  : 'bg-muted text-foreground hover:bg-muted/80'
                              }`}
                            >
                              <ChevronUp className="h-5 w-5" />
                              Previous
                            </button>
                            
                            <span className="text-sm text-muted-foreground">
                              {currentIndex + 1} of {currentItems.length}
                            </span>
                            
                            <button
                              onClick={handleNext}
                              disabled={currentIndex === currentItems.length - 1}
                              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                currentIndex === currentItems.length - 1
                                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                                  : 'bg-muted text-foreground hover:bg-muted/80'
                              }`}
                            >
                              Next
                              <ChevronDown className="h-5 w-5" />
                            </button>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <p className="text-muted-foreground text-lg">
                        Select a layer from the list to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {!selectedPhase && (
        <section className="py-16 bg-background text-center">
          <div className="container mx-auto px-4">
            <p className="text-muted-foreground text-lg">
              Click "Design", "Build", or "Run" to explore the framework
            </p>
          </div>
        </section>
      )}
      
      <Footer />
    </main>
  )
}
