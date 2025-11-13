"use client"

import { useState, useEffect } from "react"
import { Building2, Package, GitBranch, Circle, ChevronRight, Users, Database, Workflow } from "lucide-react"


export function StructureBlueprint() {
  const [activeNode, setActiveNode] = useState<string | null>(null)
  // 0: orgs, 1: products, 2: workflows, 3+: steps (one per step in first workflow)
  const totalStepCount = 4 + 1 + 1 + 4 // orgs, products, workflows, steps (first workflow has 4 steps)
  const [animationStep, setAnimationStep] = useState(0)

  useEffect(() => {
    const maxStep = 3 + 4 // 0: orgs, 1: products, 2: workflows, 3-6: steps
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % (maxStep + 1))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const organizations = [
    {
      id: "org3",
      name: "Perfected Claims",
      products: [
        "Case Development Platform",
        "Client Acquisition System",
        "Legal Partnership Network"
      ],
      color: "bg-blue-500"
    }
  ]

  // Only show the first product and its workflows/steps for the animation
  const workflows = [
    {
      id: "wf12",
      name: "Case Investigation",
      steps: 3,
      status: "Active",
      stepNames: [
        "Analyze Corporate Documents",
        "Identify Harm Patterns",
        "Assess Case Viability"
      ]
    },
    {
      id: "wf13",
      name: "Evidence Gathering",
      steps: 3,
      status: "Active",
      stepNames: [
        "Collect Evidence Files",
        "Secure Expert Testimony",
        "Interview Witnesses"
      ]
    },
    {
      id: "wf14",
      name: "Legal Strategy Development",
      steps: 3,
      status: "In Review",
      stepNames: [
        "Develop Case Strategy",
        "Plan Legal Approach",
        "Review Strategy Document"
      ]
    }
  ]

  const hierarchyLevels = [
    { level: "Organization", icon: Building2, description: "Mass tort case management provider" },
    { level: "Product", icon: Package, description: "Legal tech platforms and systems" },
    { level: "Workflow", icon: GitBranch, description: "Case and client process flows" },
    { level: "Step", icon: Circle, description: "Investigation, evidence, and legal actions" }
  ]

  return (
    <div className="w-full h-full bg-slate-950 text-white p-6 overflow-hidden relative">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-12 grid-rows-8 h-full w-full gap-px">
          {Array.from({ length: 96 }).map((_, i) => (
            <div key={i} className="border border-slate-700/30" />
          ))}
        </div>
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-sm text-cyan-400">STRUCTURE.BLUEPRINT</span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            HIERARCHICAL_ENTITIES_{animationStep + 1}/4
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-3 gap-6">
          {/* Hierarchy Levels */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono text-slate-300 mb-4">ENTITY HIERARCHY</h3>
            {hierarchyLevels.map((level, index) => {
              // Highlight the current hierarchy level as the animation progresses
              let isActive = false
              if (index === 0 && animationStep === 0) isActive = true
              if (index === 1 && animationStep === 1) isActive = true
              if (index === 2 && animationStep === 2) isActive = true
              if (index === 3 && animationStep >= 3) isActive = true
              const Icon = level.icon
              return (
                <div
                  key={level.level}
                  className={`p-3 rounded border transition-all duration-500 ${
                    isActive
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                      : "border-slate-600 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                    <span className="font-mono text-xs">{level.level.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-slate-500">{level.description}</p>
                </div>
              )
            })}
          </div>

          {/* Structure Visualization */}
          <div className="col-span-2">
            <h3 className="text-sm font-mono text-slate-300 mb-4">ENTITY RELATIONSHIPS</h3>
            <div className="space-y-4">
              {/* Organizations */}
              {organizations.map((org, orgIndex) => (
                <div key={org.id} className="space-y-2">
                  <div className={`flex items-center gap-3 p-3 rounded border transition-all duration-500 ${
                    animationStep >= 0 ? "border-blue-400 bg-blue-400/10" : "border-slate-600"
                  }`}>
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span className="font-mono text-sm text-blue-400">{org.name}</span>
                    <div className="ml-auto text-xs text-slate-400">
                      {org.products.length} products
                    </div>
                  </div>

                  {/* Products */}
                  {animationStep >= 1 && (
                    <div className="ml-6 space-y-2">
                      {org.products.map((product, prodIndex) => (
                        <div key={product} className="space-y-2">
                          <div className={`flex items-center gap-3 p-2 rounded border transition-all duration-500 ${
                            animationStep >= 1 ? "border-purple-400 bg-purple-400/10" : "border-slate-600"
                          }`}>
                            <Package className="w-3 h-3 text-purple-400" />
                            <span className="font-mono text-xs text-purple-400">{product}</span>
                            <ChevronRight className="w-3 h-3 text-slate-500 ml-auto" />
                          </div>

                          {/* Workflows: only for first product */}
                          {animationStep >= 2 && orgIndex === 0 && prodIndex === 0 && (
                            <div className="ml-6 space-y-1">
                              {workflows.map((workflow, wfIndex) => (
                                <div key={workflow.id} className="space-y-1">
                                  <div className={`flex items-center gap-2 p-2 rounded border transition-all duration-500 ${
                                    animationStep >= 2 ? "border-green-400 bg-green-400/10" : "border-slate-600"
                                  }`}>
                                    <GitBranch className="w-3 h-3 text-green-400" />
                                    <span className="font-mono text-xs text-green-400">{workflow.name}</span>
                                    <div className="ml-auto flex items-center gap-1">
                                      <span className="text-xs text-slate-400">{workflow.steps} steps</span>
                                      <div className={`w-2 h-2 rounded-full ${
                                        workflow.status === "Active" ? "bg-green-400" : "bg-yellow-400"
                                      }`} />
                                    </div>
                                  </div>

                                  {/* Steps: animate one by one for first workflow only, show step names */}
                                  {animationStep >= 3 && wfIndex === 0 && (
                                    <div className="ml-6 flex flex-col gap-1">
                                      {(workflow.stepNames ?? []).map((stepName, stepIndex) => (
                                        <div
                                          key={stepName}
                                          className={`flex items-center gap-2 px-2 py-1 rounded transition-all duration-300 text-xs font-mono ${
                                            animationStep - 3 >= stepIndex
                                              ? "bg-cyan-900/40 text-cyan-300"
                                              : "bg-slate-800/40 text-slate-500"
                                          }`}
                                        >
                                          <span className={`w-2 h-2 rounded-full ${
                                            animationStep - 3 >= stepIndex ? "bg-cyan-400 animate-pulse" : "bg-slate-700"
                                          }`} />
                                          {stepName}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-mono text-blue-400">2</div>
              <div className="text-xs text-slate-500">Organizations</div>
            </div>
            <div>
              <div className="text-lg font-mono text-purple-400">3</div>
              <div className="text-xs text-slate-500">Products</div>
            </div>
            <div>
              <div className="text-lg font-mono text-green-400">8</div>
              <div className="text-xs text-slate-500">Workflows</div>
            </div>
            <div>
              <div className="text-lg font-mono text-cyan-400">24</div>
              <div className="text-xs text-slate-500">Steps</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}