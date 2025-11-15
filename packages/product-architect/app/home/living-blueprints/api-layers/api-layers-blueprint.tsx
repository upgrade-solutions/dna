"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface LayerState {
  structure: boolean
  schema: boolean
  state: boolean
  signal: boolean
  style: boolean
}

export function APILayersBlueprint() {
  const [layers, setLayers] = useState<LayerState>({
    structure: true,
    schema: false,
    state: false,
    signal: false,
    style: false,
  })

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
      : { structure: true, schema: true, state: true, signal: true, style: false }
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
      {/* API Visualization with Overlaid Controls */}
      <div className="relative bg-slate-950 border border-slate-700 rounded-lg p-8 min-h-[540px] flex flex-col justify-center">
        {/* Layer Controls Overlay - Left Side */}
        <div className="absolute left-0 top-0 bottom-0 w-56 bg-gradient-to-r from-slate-900/95 to-slate-900/80 backdrop-blur-sm border-r border-slate-700 rounded-l-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-mono text-slate-300">LAYERS</h3>
            <div className="flex gap-1">
              <button
                onClick={cycleLayersOn}
                className="text-xs font-mono px-2 py-1 bg-purple-500 hover:bg-purple-600 rounded text-white transition-colors"
                title="Cycle through layers"
              >
                Cycle
              </button>
              <button
                onClick={toggleLayerAll}
                className="text-xs font-mono px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
              >
                {Object.values(layers).every((v) => v) ? "Reset" : "All"}
              </button>
            </div>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {[
              { key: "structure", label: "Structure", desc: "Routes & Handlers" },
              { key: "schema", label: "Schema", desc: "Request/Response" },
              { key: "state", label: "State", desc: "State management" },
              { key: "signal", label: "Signal", desc: "Event flow" },
              { key: "style", label: "Style", desc: "Not applicable" },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => key !== "structure" && key !== "style" && toggleLayer(key as keyof LayerState)}
                disabled={key === "structure" || key === "style"}
                className={`relative w-full p-3 rounded border transition-all duration-500 text-left text-xs ${
                  layers[key as keyof LayerState]
                    ? "bg-purple-900/30 border-purple-500/50 text-purple-300"
                    : "bg-slate-800/40 border-slate-700 text-slate-500 hover:bg-slate-800/60"
                } ${key === "structure" || key === "style" ? "cursor-not-allowed opacity-75" : ""}`}
              >
                <div className="flex items-start gap-2">
                  {layers[key as keyof LayerState] ? (
                    <Eye className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  ) : (
                    <EyeOff className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs font-semibold">{label}</div>
                    <div className="text-xs opacity-60 mt-0.5">{desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* API Visualization Canvas */}
        <div className="pl-60">
          <div className="max-w-2xl mx-auto w-full space-y-6">
            {/* Structure Layer - Always visible */}
            <div className="space-y-4">
              {/* API Endpoint Container */}
              <div className={`border-2 p-6 transition-colors bg-slate-800/50 border-purple-500 rounded-2xl`}>
                {/* Request Method */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded text-xs font-mono font-semibold bg-purple-500 text-white transition-all duration-500`}>
                    {layers.schema ? "POST" : "METHOD"}
                  </span>
                  <code className={`text-sm font-mono text-purple-300 transition-all duration-500`}>
                    {layers.schema ? "/api/users" : "/api/endpoint"}
                  </code>
                </div>

                {/* Request Headers */}
                {layers.structure && (
                  <div className="mb-4 p-3 bg-slate-800/50 rounded border border-slate-700 transition-all duration-500 animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs font-mono text-slate-400 mb-2">Request Headers</p>
                    <div className="space-y-1 text-xs font-mono text-slate-500">
                      <div>Content-Type: application/json</div>
                      <div>Authorization: Bearer token...</div>
                    </div>
                  </div>
                )}

                {/* Request Body */}
                {layers.structure && (
                  <div className="mb-4 p-3 bg-slate-800/50 rounded border border-slate-700 transition-all duration-500 animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs font-mono text-slate-400 mb-2">Request Body</p>
                    <pre className="text-xs font-mono text-slate-500 overflow-x-auto transition-all duration-500">
{layers.schema ? `{
  "name": "John Doe",
  "email": "john@example.com"
}` : `{
  "field1": "value1",
  "field2": "value2"
}`}
                    </pre>
                  </div>
                )}

                {/* Response Section */}
                {layers.structure && (
                  <div className="p-3 bg-emerald-900/20 rounded border border-emerald-700 transition-all duration-500 animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs font-mono text-emerald-400 mb-2">Response (200 OK)</p>
                    <pre className="text-xs font-mono text-emerald-300 overflow-x-auto transition-all duration-500">
{layers.schema ? `{
  "id": "usr_123",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-01T00:00:00Z"
}` : `{
  "status": "success",
  "data": {...}
}`}
                    </pre>
                  </div>
                )}

                {/* State Information */}
                {layers.state && (
                  <div className="mt-4 p-3 bg-yellow-900/20 rounded border border-yellow-700 transition-all duration-500 animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs font-mono text-yellow-400">
                      State: Request validated → Processing → Response sent
                    </p>
                  </div>
                )}

                {/* Signal Information */}
                {layers.signal && (
                  <div className="mt-2 p-3 bg-cyan-900/20 rounded border border-cyan-700 transition-all duration-500 animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs font-mono text-cyan-400">
                      Signal: user.created event published on success
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
