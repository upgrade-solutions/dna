"use client"

import { GitBranch } from "lucide-react"
import type { FormSchema } from "./schema-driven-form"

export interface FormVersion {
  version: string
  label: string
  date: string
  schema: FormSchema
}

interface BuildModeProps {
  formVersions: FormVersion[]
  selectedVersion: string
  onVersionChange: (version: string) => void
}

export function BuildMode({ formVersions, selectedVersion, onVersionChange }: BuildModeProps) {
  return (
    <div className="absolute left-0 top-0 bottom-0 w-56 bg-gradient-to-r from-slate-900/95 to-slate-900/80 backdrop-blur-sm border-r border-slate-700 rounded-l-lg p-4 flex flex-col">
      <div className="flex items-center mb-6">
        <GitBranch className="w-4 h-4 mr-2 text-slate-300" />
        <h3 className="text-sm font-mono text-slate-300">VERSIONS</h3>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {formVersions.map(({ version, label, date }) => (
          <button
            key={version}
            onClick={() => onVersionChange(version)}
            className={`relative w-full p-3 rounded border transition-all text-left text-xs ${
              selectedVersion === version
                ? "bg-blue-900/30 border-blue-500/50 text-blue-300"
                : "bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800/60"
            }`}
          >
            <div className="font-mono text-xs font-semibold">{version}</div>
            <div className="text-xs opacity-60 mt-1">{label}</div>
            <div className="text-xs opacity-40 mt-0.5">{date}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
