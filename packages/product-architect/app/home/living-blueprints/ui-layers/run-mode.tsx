"use client"

import { Zap, Shield, Activity, Flag, type LucideIcon } from "lucide-react"

export type RunLayer = "featureFlags" | "analytics" | "auditLog" | "accessControl"

export interface RunModeData {
  featureFlags: {
    icon: LucideIcon
    label: string
    data: Array<{ flag: string; enabled: boolean; rollout: string }>
  }
  analytics: {
    icon: LucideIcon
    label: string
    data: Array<{ action: string; count?: number; avgTime?: string; successRate?: string }>
  }
  auditLog: {
    icon: LucideIcon
    label: string
    data: Array<{ timestamp: string; user: string; action: string; result: string }>
  }
  accessControl: {
    icon: LucideIcon
    label: string
    data: Array<{ role: string; canView: boolean; canEdit: boolean; canSubmit: boolean }>
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

export function RunModeOverlay({ layer, data }: RunModeOverlayProps) {
  const Icon = data.icon
  
  return (
    <div className="mt-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-purple-400" />
        <h4 className="font-mono text-sm font-semibold text-slate-300">{data.label}</h4>
      </div>
      
      <div className="space-y-2 text-xs font-mono">
        {layer === "featureFlags" && "data" in data && data.data.map((item: any, i: number) => (
          <div key={i} className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
            <span className="text-slate-400">{item.flag}</span>
            <span className={`${item.enabled ? "text-green-400" : "text-slate-500"}`}>
              {item.enabled ? "ON" : "OFF"} ({item.rollout})
            </span>
          </div>
        ))}
        
        {layer === "analytics" && "data" in data && data.data.map((item: any, i: number) => (
          <div key={i} className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
            <span className="text-slate-400">{item.action}</span>
            <span className="text-blue-400">
              {item.count && `${item.count}x`}
              {item.avgTime && ` • ${item.avgTime}`}
              {item.successRate && ` • ${item.successRate}`}
            </span>
          </div>
        ))}
        
        {layer === "auditLog" && "data" in data && data.data.map((item: any, i: number) => (
          <div key={i} className="p-2 bg-slate-800/50 rounded space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">{item.timestamp}</span>
              <span className={`${item.result === "success" ? "text-green-400" : "text-red-400"}`}>
                {item.result}
              </span>
            </div>
            <div className="text-slate-400">{item.user} • {item.action}</div>
          </div>
        ))}
        
        {layer === "accessControl" && "data" in data && data.data.map((item: any, i: number) => (
          <div key={i} className="p-2 bg-slate-800/50 rounded">
            <div className="font-semibold text-slate-300 mb-1">{item.role}</div>
            <div className="flex gap-3 text-xs">
              <span className={item.canView ? "text-green-400" : "text-red-400"}>
                View: {item.canView ? "✓" : "✗"}
              </span>
              <span className={item.canEdit ? "text-green-400" : "text-red-400"}>
                Edit: {item.canEdit ? "✓" : "✗"}
              </span>
              <span className={item.canSubmit ? "text-green-400" : "text-red-400"}>
                Submit: {item.canSubmit ? "✓" : "✗"}
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
      { flag: "email_validation", enabled: true, rollout: "100%" },
      { flag: "terms_checkbox", enabled: true, rollout: "100%" },
      { flag: "advanced_mode", enabled: false, rollout: "0%" },
    ],
  },
  analytics: {
    icon: Activity,
    label: "User Analytics",
    data: [
      { action: "form_view", count: 1247, avgTime: "2.3s" },
      { action: "field_focus:name", count: 1189, avgTime: "5.1s" },
      { action: "field_focus:email", count: 1156, avgTime: "4.8s" },
      { action: "checkbox_toggle", count: 1098, avgTime: "1.2s" },
      { action: "form_submit", count: 1042, successRate: "94%" },
    ],
  },
  auditLog: {
    icon: Zap,
    label: "Audit Log",
    data: [
      { timestamp: "2024-11-14 14:32:01", user: "user@example.com", action: "form_submit", result: "success" },
      { timestamp: "2024-11-14 14:31:45", user: "user@example.com", action: "field_update:email", result: "success" },
      { timestamp: "2024-11-14 14:31:30", user: "user@example.com", action: "field_update:name", result: "success" },
      { timestamp: "2024-11-14 14:31:15", user: "user@example.com", action: "form_view", result: "success" },
    ],
  },
  accessControl: {
    icon: Shield,
    label: "Access Control",
    data: [
      { role: "Admin", canView: true, canEdit: true, canSubmit: true },
      { role: "User", canView: true, canEdit: true, canSubmit: true },
      { role: "Guest", canView: true, canEdit: false, canSubmit: false },
      { role: "Viewer", canView: true, canEdit: false, canSubmit: false },
    ],
  },
})
