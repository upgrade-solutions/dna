"use client"

import { useState, useEffect } from "react"
import { Users, ArrowRight, Circle, CheckCircle, Clock, AlertCircle } from "lucide-react"

export function WorkflowVisualization() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 5)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  const workflowSteps = [
    { 
      id: "s1",
      actor: "Customer", 
      action: "Submit", 
      resource: "Registration Form",
      status: "completed"
    },
    { 
      id: "s2",
      actor: "System", 
      action: "Validate", 
      resource: "Form Data",
      status: "completed"
    },
    { 
      id: "s3",
      actor: "KYC Agent", 
      action: "Review", 
      resource: "Identity Documents",
      status: "active"
    },
    { 
      id: "s4",
      actor: "System", 
      action: "Create", 
      resource: "Customer Profile",
      status: "pending"
    },
    { 
      id: "s5",
      actor: "Notification Service", 
      action: "Send", 
      resource: "Welcome Email",
      status: "pending"
    }
  ]

  const getStepStatus = (index: number) => {
    if (index < currentStep) return "completed"
    if (index === currentStep) return "active"
    return "pending"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "active":
        return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />
      default:
        return <Circle className="w-4 h-4 text-slate-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-400 bg-green-400/10 text-green-400"
      case "active":
        return "border-yellow-400 bg-yellow-400/10 text-yellow-400"
      default:
        return "border-slate-600 bg-slate-800/50 text-slate-400"
    }
  }

  return (
    <div className="w-full h-full bg-slate-950 text-white p-6">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-sm text-cyan-400">WORKFLOW.PROCESS</span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            CUSTOMER_ONBOARDING.WF
          </div>
        </div>

        {/* Workflow Title */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-2">Customer Onboarding Workflow</h3>
          <p className="text-sm text-slate-400">New customer registration and verification process</p>
        </div>

        {/* Workflow Steps */}
        <div className="flex-1 space-y-4">
          {workflowSteps.map((step, index) => {
            const status = getStepStatus(index)
            return (
              <div key={step.id} className="flex items-center gap-4">
                {/* Step Indicator */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className={`w-px h-8 mt-2 transition-all duration-500 ${
                      status === "completed" ? "bg-green-400" : "bg-slate-600"
                    }`} />
                  )}
                </div>

                {/* Step Content */}
                <div className={`flex-1 p-4 rounded-lg border transition-all duration-500 ${getStatusColor(status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded">
                        {step.actor}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="font-semibold text-sm">{step.action}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-sm text-slate-300">{step.resource}</span>
                    </div>
                    <div className="text-xs font-mono text-slate-500">
                      {step.id}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Workflow Progress</span>
            <span className="text-sm text-slate-400">{currentStep}/5 steps</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}