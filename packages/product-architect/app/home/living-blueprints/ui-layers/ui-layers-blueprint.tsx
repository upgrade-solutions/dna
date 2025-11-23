"use client"

import { useState } from "react"
import { SchemaDrivenForm } from "./schema-driven-form"
import { DesignMode } from "./design-mode"
import { BuildMode, type VersionStatus } from "./build-mode"
import { RunModeSidebar, RunModeOverlay, createRunModeData, type RunLayer } from "./run-mode"
import { formVersions as initialFormVersions } from "./form-versions"

type Mode = "design" | "build" | "run"

interface LayerState {
  structure: boolean
  schema: boolean
  state: boolean
  signal: boolean
  style: boolean
}

export function UILayersBlueprint() {
  const [mode, setMode] = useState<Mode>("design")
  const [layers, setLayers] = useState<LayerState>({
    structure: true,
    schema: false,
    state: false,
    signal: false,
    style: false,
  })
  const [selectedVersion, setSelectedVersion] = useState<string>("v1.2.1")
  const [selectedRunLayer, setSelectedRunLayer] = useState<RunLayer>("featureFlags")
  const [formVersions, setFormVersions] = useState(initialFormVersions)

  const currentSchema = formVersions.find((v) => v.version === selectedVersion)?.schema || formVersions[0].schema
  const runModeData = createRunModeData()

  const handleStatusChange = (version: string, newStatus: VersionStatus) => {
    setFormVersions((prev) =>
      prev.map((v) => (v.version === version ? { ...v, status: newStatus } : v))
    )
  }

  // For Build and Run modes, all layers should be on
  const allLayersOn: LayerState = {
    structure: true,
    schema: true,
    state: true,
    signal: true,
    style: true,
  }

  const effectiveLayers = mode === "design" ? layers : allLayersOn

  const toggleLayer = (layer: keyof LayerState) => {
    setLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }))
  }

  const toggleLayerAll = () => {
    const allOn = Object.values(layers).every((v) => v)
    const newState = allOn
      ? { structure: true, schema: false, state: false, signal: false, style: false }
      : { structure: true, schema: true, state: true, signal: true, style: true }
    setLayers(newState)
  }

  const cycleLayersOn = () => {
    const layerOrder: Array<keyof LayerState> = ['structure', 'schema', 'state', 'signal', 'style']
    let currentIndex = 0
    
    const cycle = () => {
      if (currentIndex < layerOrder.length) {
        const layer = layerOrder[currentIndex]
        setLayers(prev => ({ ...prev, [layer]: true }))
        currentIndex++
        setTimeout(cycle, 3000) // 3000ms between each layer
      }
    }
    
    // Reset all layers first
    setLayers({ structure: false, schema: false, state: false, signal: false, style: false })
    
    // Start cycling after a brief pause
    setTimeout(cycle, 500)
  }

  return (
    <div className="w-full">
      {/* Mode Tabs */}
      <div className="flex justify-center gap-2 border-b border-slate-700">
        {[
          { key: "design", label: "Design", desc: "Layer visualization" },
          { key: "build", label: "Build", desc: "Version history" },
          { key: "run", label: "Run", desc: "Runtime insights" },
        ].map(({ key, label, desc }) => (
          <button
            key={key}
            onClick={() => setMode(key as Mode)}
            className={`px-4 py-2 border-b-2 transition-all ${
              mode === key
                ? "border-blue-500 text-blue-300 bg-slate-800/50"
                : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/30"
            }`}
          >
            <div className="font-mono text-sm font-semibold">{label}</div>
            <div className="text-xs opacity-60">{desc}</div>
          </button>
        ))}
      </div>

      {/* Form Visualization with Overlaid Controls */}
      <div 
        className="relative bg-slate-950 border border-slate-700 p-8 min-h-[340px] flex flex-col justify-center"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      >
        {/* Design Mode - Layer Controls */}
        {mode === "design" && (
          <DesignMode
            layers={layers}
            toggleLayer={toggleLayer}
            toggleLayerAll={toggleLayerAll}
            cycleLayersOn={cycleLayersOn}
          />
        )}

        {/* Build Mode - Version History */}
        {mode === "build" && (
          <BuildMode
            formVersions={formVersions}
            selectedVersion={selectedVersion}
            onVersionChange={setSelectedVersion}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Run Mode - Runtime Insights */}
        {mode === "run" && (
          <RunModeSidebar
            runModeData={runModeData}
            selectedRunLayer={selectedRunLayer}
            onLayerChange={setSelectedRunLayer}
          />
        )}

        {/* Form Visualization Canvas */}
        <div className={mode === "build" ? "pl-64" : "pl-60"}>
          <div className="max-w-md mx-auto w-full space-y-6 bg-slate-950 p-6 ">
            {mode === "design" && <SchemaDrivenForm schema={currentSchema} layers={effectiveLayers} />}
            {mode === "build" && <SchemaDrivenForm schema={currentSchema} layers={effectiveLayers} hideAnnotations />}
            {mode === "run" && (
              <>
                <SchemaDrivenForm schema={currentSchema} layers={effectiveLayers} hideAnnotations />
                <RunModeOverlay layer={selectedRunLayer} data={runModeData[selectedRunLayer]} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

