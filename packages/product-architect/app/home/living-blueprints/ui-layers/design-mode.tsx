"use client"

import { Eye, EyeOff, Layers } from "lucide-react"

interface LayerState {
  structure: boolean
  schema: boolean
  state: boolean
  signal: boolean
  style: boolean
}

interface DesignModeProps {
  layers: LayerState
  toggleLayer: (layer: keyof LayerState) => void
  toggleLayerAll: () => void
  cycleLayersOn: () => void
}

export function DesignMode({ layers, toggleLayer, toggleLayerAll, cycleLayersOn }: DesignModeProps) {
  return (
    <div className="absolute left-0 top-0 bottom-0 w-56 bg-gradient-to-r from-slate-900/95 to-slate-900/80 backdrop-blur-sm border-r border-slate-700 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Layers className="w-4 h-4 mr-2 text-slate-300" />
          <h3 className="text-sm font-mono text-slate-300">LAYERS</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={cycleLayersOn}
            className="text-xs font-mono px-2 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white transition-colors"
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
          { key: "structure", label: "Structure", desc: "Base layer" },
          { key: "schema", label: "Schema", desc: "Labels & text" },
          { key: "state", label: "State", desc: "Field conditions" },
          { key: "signal", label: "Signal", desc: "Event flow" },
          { key: "style", label: "Style", desc: "Theming" },
        ].map(({ key, label, desc }) => (
          <button
            key={key}
            onClick={() => key !== "structure" && toggleLayer(key as keyof LayerState)}
            disabled={key === "structure"}
            className={`relative w-full p-3 rounded border transition-all duration-500 text-left text-xs ${
              layers[key as keyof LayerState]
                ? "bg-blue-900/30 border-blue-500/50 text-blue-300"
                : "bg-slate-800/40 border-slate-700 text-slate-500 hover:bg-slate-800/60"
            } ${key === "structure" ? "cursor-not-allowed opacity-75" : ""}`}
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
  )
}
