"use client"

import { Zap, Shield, Activity, Flag, type LucideIcon } from "lucide-react"

export type RunLayer = "featureFlags" | "analytics" | "auditLog" | "accessControl"

export interface RunModeData {
  featureFlags: {
    icon: LucideIcon
    label: string
    data: Array<{ flag: string; enabled: boolean; fieldName?: string }>
  }
  analytics: {
    icon: LucideIcon
    label: string
    data: Array<{ action: string; actionType: string; count: number; fieldName?: string }>
  }
  auditLog: {
    icon: LucideIcon
    label: string
    data: Array<{ timestamp: string; user: string; action: string; result: string; fieldName?: string }>
  }
  accessControl: {
    icon: LucideIcon
    label: string
    data: Array<{ role: string; canView: boolean; canEdit: boolean }>
  }
}

interface RunModeSidebarProps {
  runModeData: RunModeData
  selectedRunLayer: RunLayer
  onLayerChange: (layer: RunLayer) => void
}

interface RunModeOverlayProps {
  layer: RunLayer
  data: RunModeData[RunLayer]
  selectedHotspot: string | null
  onToggleFeature?: (flag: string) => void
}

export function RunModeSidebar({ runModeData, selectedRunLayer, onLayerChange }: RunModeSidebarProps) {
  return (
    <div className="absolute left-0 top-0 bottom-0 w-56 bg-gradient-to-r from-slate-900/95 to-slate-900/80 backdrop-blur-sm border-r border-slate-700 p-4 flex flex-col">
      <div className="flex items-center mb-6">
        <Zap className="w-4 h-4 mr-2 text-slate-300" />
        <h3 className="text-sm font-mono text-slate-300">INSIGHTS</h3>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {Object.entries(runModeData).map(([key, { icon: Icon, label }]) => (
          <button
            key={key}
            onClick={() => onLayerChange(key as RunLayer)}
            className={`relative w-full p-3 rounded border transition-all text-left text-xs ${
              selectedRunLayer === key
                ? "bg-blue-900/30 border-blue-500/50 text-blue-300"
                : "bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-3 h-3 flex-shrink-0" />
              <div className="font-mono text-xs font-semibold">{label}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function RunModeOverlay({ layer, data, selectedHotspot, onToggleFeature }: RunModeOverlayProps) {
  const Icon = data.icon
  
  // Filter data based on selected hotspot
  const filteredData = selectedHotspot && 'data' in data
    ? data.data.filter((item: any) => item.fieldName === selectedHotspot)
    : 'data' in data ? data.data : []
  
  return (
    <div className="absolute right-0 top-0 bottom-0 w-56 bg-gradient-to-l from-slate-900/95 to-slate-900/80 backdrop-blur-sm border-l border-slate-700 p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-blue-400" />
        <h4 className="font-mono text-sm font-semibold text-slate-300">{data.label}</h4>
        {selectedHotspot && (
          <span className="ml-auto text-xs text-slate-400">• {selectedHotspot}</span>
        )}
      </div>
      
      <div className="space-y-2 text-xs font-mono flex-1 overflow-y-auto">
        {layer === "featureFlags" && filteredData.map((item: any, i: number) => (
          <div key={i} className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
            <span className="text-slate-400">{item.flag}</span>
            <button
              onClick={() => onToggleFeature?.(item.flag)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                item.enabled ? "bg-blue-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  item.enabled ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
        
        {layer === "analytics" && filteredData.map((item: any, i: number) => (
          <div key={i} className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
            <span className="text-slate-400">{item.action} <span className="text-slate-500">({item.actionType})</span></span>
            <span className="text-blue-400">{item.count}x</span>
          </div>
        ))}
        
        {layer === "auditLog" && filteredData.map((item: any, i: number) => (
          <div key={i} className="p-2 bg-slate-800/50 rounded space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">{item.timestamp}</span>
              <span className={`${item.result === "success" ? "text-blue-400" : "text-red-400"}`}>
                {item.result}
              </span>
            </div>
            <div className="text-slate-400">{item.user} • {item.action}</div>
          </div>
        ))}
        
        {layer === "accessControl" && 'data' in data && data.data.map((item: any, i: number) => (
          <div key={i} className="p-2 bg-slate-800/50 rounded">
            <div className="font-semibold text-slate-300 mb-1">{item.role}</div>
            <div className="flex gap-3 text-xs">
              <span className={item.canView ? "text-blue-400" : "text-red-400"}>
                View: {item.canView ? "✓" : "✗"}
              </span>
              <span className={item.canEdit ? "text-blue-400" : "text-red-400"}>
                Edit: {item.canEdit ? "✓" : "✗"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const createRunModeData = (): RunModeData => ({
  featureFlags: {
    icon: Flag,
    label: "Feature Flags",
    data: [
      { flag: "name_field", enabled: true, fieldName: "name" },
      { flag: "email_field", enabled: true, fieldName: "email" },
      { flag: "terms_checkbox", enabled: true, fieldName: "agreeToTerms" },
    ],
  },
  analytics: {
    icon: Activity,
    label: "User Analytics",
    data: [
      { action: "name", actionType: "entered", count: 2345, fieldName: "name" },
      { action: "email", actionType: "entered", count: 2245, fieldName: "email" },
      { action: "agreeToTerms", actionType: "checked", count: 1098, fieldName: "agreeToTerms" },
    ],
  },
  auditLog: {
    icon: Zap,
    label: "Audit Log",
    data: [
      { timestamp: "2025-11-14 14:31:20", user: "user@example.com", action: "name_updated", result: "success", fieldName: "name" },
      { timestamp: "2025-11-14 14:31:28", user: "user@example.com", action: "email_updated", result: "success", fieldName: "email" },
      { timestamp: "2025-11-14 14:31:29", user: "user@example.com", action: "email_validated", result: "success", fieldName: "email" },
      { timestamp: "2025-11-14 14:31:45", user: "user@example.com", action: "agreeToTerms_checked", result: "success", fieldName: "agreeToTerms" },
    ],
  },
  accessControl: {
    icon: Shield,
    label: "Access Control",
    data: [
      { role: "Guest", canView: true, canEdit: true },
    ],
  },
})
