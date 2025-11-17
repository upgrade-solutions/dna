"use client"

import { GitBranch, Circle } from "lucide-react"
import type { FormSchema } from "./schema-driven-form"

export type VersionStatus = "planned" | "in-development" | "deployed" | "released" | "deprecated"

export interface FormVersion {
  version: string
  label: string
  date: string
  schema: FormSchema
  status: VersionStatus
}

const statusConfig: Record<VersionStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  planned: {
    label: "Planned",
    color: "text-slate-400",
    bgColor: "bg-slate-800/30",
    borderColor: "border-slate-600",
  },
  "in-development": {
    label: "In Development",
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/20",
    borderColor: "border-yellow-600/50",
  },
  deployed: {
    label: "Deployed",
    color: "text-blue-400",
    bgColor: "bg-blue-900/20",
    borderColor: "border-blue-600/50",
  },
  released: {
    label: "Released",
    color: "text-green-400",
    bgColor: "bg-green-900/20",
    borderColor: "border-green-600/50",
  },
  deprecated: {
    label: "Deprecated",
    color: "text-red-400",
    bgColor: "bg-red-900/20",
    borderColor: "border-red-600/50",
  },
}

interface BuildModeProps {
  formVersions: FormVersion[]
  selectedVersion: string
  onVersionChange: (version: string) => void
  onStatusChange?: (version: string, newStatus: VersionStatus) => void
}

export function BuildMode({ formVersions, selectedVersion, onVersionChange, onStatusChange }: BuildModeProps) {
  const handleStatusClick = (e: React.MouseEvent, version: string, currentStatus: VersionStatus) => {
    e.stopPropagation()
    if (!onStatusChange) return

    // Cycle through lifecycle: planned -> in-development -> deployed -> released -> deprecated
    const lifecycle: VersionStatus[] = ["planned", "in-development", "deployed", "released", "deprecated"]
    const currentIndex = lifecycle.indexOf(currentStatus)
    const nextStatus = lifecycle[(currentIndex + 1) % lifecycle.length]
    onStatusChange(version, nextStatus)
  }

  return (
    <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-slate-900/95 to-slate-900/80 backdrop-blur-sm border-r border-slate-700 p-4 flex flex-col">
      <div className="flex items-center mb-6">
        <GitBranch className="w-4 h-4 mr-2 text-slate-300" />
        <h3 className="text-sm font-mono text-slate-300">VERSIONS</h3>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {formVersions.map(({ version, label, date, status }) => {
          const config = statusConfig[status]
          return (
            <button
              key={version}
              onClick={() => onVersionChange(version)}
              className={`relative w-full p-3 rounded border transition-all text-left text-xs ${
                selectedVersion === version
                  ? "bg-blue-900/30 border-blue-500/50 text-blue-300"
                  : "bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-mono text-xs font-semibold">{version}</div>
                <button
                  onClick={(e) => handleStatusClick(e, version, status)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                    config.bgColor
                  } ${config.borderColor} border ${config.color} hover:opacity-80`}
                  title={`Click to change status (current: ${config.label})`}
                >
                  <Circle className="w-2 h-2" fill="currentColor" />
                  {config.label}
                </button>
              </div>
              <div className="text-xs opacity-60 mt-1">{label}</div>
              <div className="text-xs opacity-40 mt-0.5">{date}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
