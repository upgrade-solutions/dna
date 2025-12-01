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
    color: "text-slate-200",
    bgColor: "bg-slate-800/50",
    borderColor: "border-slate-500",
  },
  "in-development": {
    label: "In Development",
    color: "text-yellow-300",
    bgColor: "bg-yellow-900/30",
    borderColor: "border-yellow-500",
  },
  deployed: {
    label: "Deployed",
    color: "text-blue-300",
    bgColor: "bg-blue-900/30",
    borderColor: "border-blue-400",
  },
  released: {
    label: "Released",
    color: "text-green-300",
    bgColor: "bg-green-900/30",
    borderColor: "border-green-400",
  },
  deprecated: {
    label: "Deprecated",
    color: "text-red-300",
    bgColor: "bg-red-900/30",
    borderColor: "border-red-400",
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
        <GitBranch className="w-4 h-4 mr-2 text-slate-200" />
        <h3 className="text-sm font-mono text-slate-100">VERSIONS</h3>
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
                  ? "bg-blue-900/40 border-blue-400 text-blue-200"
                  : "bg-slate-800/40 border-slate-600 text-slate-200 hover:bg-slate-800/60 hover:border-slate-500"
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
