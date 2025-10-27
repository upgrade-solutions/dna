"use client"

import { useState, useEffect } from "react"
import { Building2, Package, GitBranch, Circle, ArrowRight } from "lucide-react"

export function EntityRelationships() {
  const [highlightedPath, setHighlightedPath] = useState<string[]>([])
  const [animationStep, setAnimationStep] = useState(0)

  useEffect(() => {
    const paths = [
      ["org1", "product1", "workflow1"],
      ["org1", "product2", "workflow3"],  
      ["org2", "product3", "workflow4"],
      []
    ]
    
    const interval = setInterval(() => {
      setAnimationStep((prev) => {
        const next = (prev + 1) % paths.length
        setHighlightedPath(paths[next])
        return next
      })
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  // Organized entity structure similar to database blueprint
  const entities = {
    organizations: [
      { id: "org1", name: "Financial Services", x: 50, y: 60, width: 140, height: 80 },
      { id: "org2", name: "Media Distribution", x: 50, y: 200, width: 140, height: 60 }
    ],
    products: [
      { id: "product1", name: "Loan Platform", orgId: "org1", x: 250, y: 40, width: 120, height: 60 },
      { id: "product2", name: "Banking Core", orgId: "org1", x: 250, y: 120, width: 120, height: 60 },
      { id: "product3", name: "Content Platform", orgId: "org2", x: 250, y: 200, width: 120, height: 60 }
    ],
    workflows: [
      { id: "workflow1", name: "Customer Onboarding", productId: "product1", x: 420, y: 20, width: 130, height: 50 },
      { id: "workflow2", name: "Loan Application", productId: "product1", x: 420, y: 80, width: 130, height: 50 },
      { id: "workflow3", name: "Payment Processing", productId: "product2", x: 420, y: 140, width: 130, height: 50 },
      { id: "workflow4", name: "Content Publishing", productId: "product3", x: 420, y: 200, width: 130, height: 50 }
    ]
  }

  const isHighlighted = (id: string) => highlightedPath.includes(id)

  // Draw relationship line similar to database blueprint
  const drawConnection = (from: any, to: any, isHighlighted: boolean) => {
    const fromX = from.x + from.width
    const fromY = from.y + from.height / 2
    const toX = to.x  
    const toY = to.y + to.height / 2

    const midX = fromX + (toX - fromX) * 0.5

    return (
      <g key={`${from.id}-${to.id}`}>
        {/* Connection line */}
        <path
          d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
          stroke={isHighlighted ? "#06b6d4" : "#475569"}
          strokeWidth={isHighlighted ? 2 : 1}
          fill="none"
          strokeDasharray={isHighlighted ? "none" : "3,3"}
          className="transition-all duration-500"
        />
        {/* Arrow */}
        <polygon
          points={`${toX},${toY} ${toX-8},${toY-4} ${toX-8},${toY+4}`}
          fill={isHighlighted ? "#06b6d4" : "#475569"}
          className="transition-all duration-500"
        />
      </g>
    )
  }

  return (
    <div className="w-full h-full bg-slate-950 text-white p-6">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-sm text-cyan-400">ENTITY.RELATIONSHIPS</span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            PATH_{animationStep + 1}/4
          </div>
        </div>

        {/* Entity Relationship Diagram */}
        <div className="flex-1 relative overflow-hidden">
          <svg viewBox="0 0 600 300" className="w-full h-full">
            {/* Grid Background */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Connection Lines */}
            {/* Organization to Product connections */}
            {entities.products.map(product => {
              const org = entities.organizations.find(o => o.id === product.orgId)!
              const pathHighlighted = isHighlighted(org.id) && isHighlighted(product.id)
              return drawConnection(org, product, pathHighlighted)
            })}

            {/* Product to Workflow connections */}
            {entities.workflows.map(workflow => {
              const product = entities.products.find(p => p.id === workflow.productId)!
              const pathHighlighted = isHighlighted(product.id) && isHighlighted(workflow.id)
              return drawConnection(product, workflow, pathHighlighted)
            })}

            {/* Organizations */}
            {entities.organizations.map(org => (
              <g key={org.id}>
                {/* Organization Box */}
                <rect
                  x={org.x}
                  y={org.y}
                  width={org.width}
                  height={org.height}
                  fill={isHighlighted(org.id) ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)"}
                  stroke={isHighlighted(org.id) ? "#3b82f6" : "#475569"}
                  strokeWidth={isHighlighted(org.id) ? 2 : 1}
                  rx="4"
                  className="transition-all duration-500"
                />
                {/* Organization Header */}
                <rect
                  x={org.x}
                  y={org.y}
                  width={org.width}
                  height="25"
                  fill={isHighlighted(org.id) ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.15)"}
                  rx="4"
                  className="transition-all duration-500"
                />
                {/* Organization Icon */}
                <circle
                  cx={org.x + 15}
                  cy={org.y + 12}
                  r="6"
                  fill={isHighlighted(org.id) ? "#3b82f6" : "#64748b"}
                  className="transition-all duration-500"
                />
                {/* Organization Name */}
                <text
                  x={org.x + 28}
                  y={org.y + 17}
                  fill={isHighlighted(org.id) ? "#3b82f6" : "#e2e8f0"}
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="transition-all duration-500"
                >
                  {org.name}
                </text>
                {/* Organization Details */}
                <text
                  x={org.x + 10}
                  y={org.y + 40}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  Business Division
                </text>
                <text
                  x={org.x + 10}
                  y={org.y + 55}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  Products: {entities.products.filter(p => p.orgId === org.id).length}
                </text>
              </g>
            ))}

            {/* Products */}
            {entities.products.map(product => (
              <g key={product.id}>
                {/* Product Box */}
                <rect
                  x={product.x}
                  y={product.y}
                  width={product.width}
                  height={product.height}
                  fill={isHighlighted(product.id) ? "rgba(168, 85, 247, 0.2)" : "rgba(168, 85, 247, 0.1)"}
                  stroke={isHighlighted(product.id) ? "#a855f7" : "#475569"}
                  strokeWidth={isHighlighted(product.id) ? 2 : 1}
                  rx="4"
                  className="transition-all duration-500"
                />
                {/* Product Header */}
                <rect
                  x={product.x}
                  y={product.y}
                  width={product.width}
                  height="22"
                  fill={isHighlighted(product.id) ? "rgba(168, 85, 247, 0.3)" : "rgba(168, 85, 247, 0.15)"}
                  rx="4"
                  className="transition-all duration-500"
                />
                {/* Product Icon */}
                <rect
                  x={product.x + 8}
                  y={product.y + 7}
                  width="8"
                  height="8"
                  fill={isHighlighted(product.id) ? "#a855f7" : "#64748b"}
                  rx="1"
                  className="transition-all duration-500"
                />
                {/* Product Name */}
                <text
                  x={product.x + 22}
                  y={product.y + 15}
                  fill={isHighlighted(product.id) ? "#a855f7" : "#e2e8f0"}
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="transition-all duration-500"
                >
                  {product.name}
                </text>
                {/* Product Details */}
                <text
                  x={product.x + 8}
                  y={product.y + 35}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  Software Product
                </text>
                <text
                  x={product.x + 8}
                  y={product.y + 48}
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  Workflows: {entities.workflows.filter(w => w.productId === product.id).length}
                </text>
              </g>
            ))}

            {/* Workflows */}
            {entities.workflows.map(workflow => (
              <g key={workflow.id}>
                {/* Workflow Box */}
                <rect
                  x={workflow.x}
                  y={workflow.y}
                  width={workflow.width}
                  height={workflow.height}
                  fill={isHighlighted(workflow.id) ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.1)"}
                  stroke={isHighlighted(workflow.id) ? "#10b981" : "#475569"}
                  strokeWidth={isHighlighted(workflow.id) ? 2 : 1}
                  rx="4"
                  className="transition-all duration-500"
                />
                {/* Workflow Header */}
                <rect
                  x={workflow.x}
                  y={workflow.y}
                  width={workflow.width}
                  height="20"
                  fill={isHighlighted(workflow.id) ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.15)"}
                  rx="4"
                  className="transition-all duration-500"
                />
                {/* Workflow Icon */}
                <polygon
                  points={`${workflow.x + 12},${workflow.y + 10} ${workflow.x + 8},${workflow.y + 6} ${workflow.x + 8},${workflow.y + 14} ${workflow.x + 16},${workflow.y + 10}`}
                  fill={isHighlighted(workflow.id) ? "#10b981" : "#64748b"}
                  className="transition-all duration-500"
                />
                {/* Workflow Name */}
                <text
                  x={workflow.x + 20}
                  y={workflow.y + 14}
                  fill={isHighlighted(workflow.id) ? "#10b981" : "#e2e8f0"}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="transition-all duration-500"
                >
                  {workflow.name}
                </text>
                {/* Workflow Details */}
                <text
                  x={workflow.x + 8}
                  y={workflow.y + 32}
                  fill="#94a3b8"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  Business Process
                </text>
                <text
                  x={workflow.x + 8}
                  y={workflow.y + 42}
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  Status: Active
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-3 bg-blue-500/20 border border-blue-500 rounded"></div>
              <span className="text-xs text-slate-400">Organizations</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-3 bg-purple-500/20 border border-purple-500 rounded"></div>
              <span className="text-xs text-slate-400">Products</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-3 bg-green-500/20 border border-green-500 rounded"></div>
              <span className="text-xs text-slate-400">Workflows</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}