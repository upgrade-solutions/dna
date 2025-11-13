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

export function UILayersBlueprint() {
  const [layers, setLayers] = useState<LayerState>({
    structure: true,
    schema: false,
    state: false,
    signal: false,
    style: false,
  })

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subscribe: false,
    agreeToTerms: false,
    nameDisabled: false,
    emailDisabled: false,
    nameError: false,
    emailError: false,
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
      : { structure: true, schema: true, state: true, signal: true, style: true }
    setLayers(newState)
  }

  const isSubmitDisabled = layers.state ? !formState.agreeToTerms : false

  const handleFormChange = (field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="w-full">
      {/* Form Visualization with Overlaid Controls */}
      <div className="relative bg-slate-950 border border-slate-700 rounded-lg p-8 min-h-[540px] flex flex-col justify-center">
        {/* Layer Controls Overlay - Left Side */}
        <div className="absolute left-0 top-0 bottom-0 w-56 bg-gradient-to-r from-slate-900/95 to-slate-900/80 backdrop-blur-sm border-r border-slate-700 rounded-l-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-mono text-slate-300">LAYERS</h3>
            <button
              onClick={toggleLayerAll}
              className="text-xs font-mono px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
            >
              {Object.values(layers).every((v) => v) ? "Reset" : "All"}
            </button>
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
                className={`relative w-full p-3 rounded border transition-all text-left text-xs ${
                  layers[key as keyof LayerState]
                    ? "bg-emerald-900/30 border-emerald-500/50 text-emerald-300"
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

        {/* Form Visualization Canvas */}
        <div className="pl-60">
        <div className="max-w-md mx-auto w-full space-y-6">
          {/* Structure Layer - Always visible */}
          <div className="space-y-4">
            {/* Form Container */}
            <div className={`border-2 p-6 transition-colors ${
              layers.style
                ? "bg-slate-800/50 border-blue-500 rounded-2xl"
                : "bg-slate-900/50 border-slate-700"
            }`}>
              {/* Name Field */}
              <div className="space-y-2 mb-6">
                {layers.structure && (
                  <label
                    htmlFor="name"
                    className={`block text-sm font-medium transition-colors ${
                      layers.style ? "text-blue-300" : "text-slate-400"
                    }`}
                  >
                    {layers.schema ? "Full Name" : "Field 1"}
                  </label>
                )}
                <input
                  id="name"
                  type="text"
                  placeholder={layers.schema ? "Enter full name" : ""}
                  value={formState.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  disabled={layers.state && formState.nameDisabled}
                  className={`w-full px-4 py-2 rounded border transition-all ${
                    layers.style
                      ? `bg-slate-800 text-slate-100 border-blue-500 focus:border-blue-500 focus:outline-blue-500 rounded-lg ${
                          formState.nameError ? "border-red-500 outline-red-500" : ""
                        } ${formState.nameDisabled ? "opacity-50" : ""}`
                      : `bg-slate-900 text-slate-300 border-slate-700 rounded ${
                          formState.nameError ? "border-red-500 outline-red-500" : ""
                        } ${formState.nameDisabled ? "opacity-50" : ""}`
                  } disabled:cursor-not-allowed`}
                  aria-describedby={layers.state && formState.nameError ? "name-error" : undefined}
                />
                {layers.state && formState.nameError && (
                  <p id="name-error" className="text-sm text-red-500">
                    Field is required
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2 mb-6">
                {layers.structure && (
                  <label
                    htmlFor="email"
                    className={`block text-sm font-medium transition-colors ${
                      layers.style ? "text-blue-300" : "text-slate-400"
                    }`}
                  >
                    {layers.schema ? "Email Address" : "Field 2"}
                  </label>
                )}
                <input
                  id="email"
                  type="email"
                  placeholder={layers.schema ? "Enter email address" : ""}
                  value={formState.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  disabled={layers.state && formState.emailDisabled}
                  className={`w-full px-4 py-2 border transition-all ${
                    layers.style
                      ? `bg-slate-800 text-slate-100 border-blue-500 focus:border-blue-500 focus:outline-blue-500 rounded-lg ${
                          formState.emailError ? "border-red-500 outline-red-500" : ""
                        } ${formState.emailDisabled ? "opacity-50" : ""}`
                      : `bg-slate-900 text-slate-300 border-slate-700 rounded ${
                          formState.emailError ? "border-red-500 outline-red-500" : ""
                        } ${formState.emailDisabled ? "opacity-50" : ""}`
                  } disabled:cursor-not-allowed`}
                  aria-describedby={layers.state && formState.emailError ? "email-error" : undefined}
                />
                {layers.state && formState.emailError && (
                  <p id="email-error" className="text-sm text-red-500">
                    Field is required
                  </p>
                )}
              </div>

              {/* Agree to Terms Checkbox */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-3">
                  <input
                    id="agree-terms"
                    type="checkbox"
                    checked={formState.agreeToTerms}
                    onChange={(e) => handleFormChange("agreeToTerms", e.target.checked)}
                    className={`w-4 h-4 border transition-all cursor-pointer ${
                      layers.style
                        ? "border-blue-500 bg-slate-800 accent-blue-500"
                        : "border-slate-700 bg-slate-900 accent-slate-500"
                    }`}
                  />
                  {layers.structure && (
                    <label
                      htmlFor="agree-terms"
                      className={`text-sm font-medium transition-colors cursor-pointer ${
                        layers.style ? "text-blue-300" : "text-slate-400"
                      }`}
                    >
                      {layers.schema ? "I agree to the terms and conditions" : "Checkbox field"}
                    </label>
                  )}
                </div>

                {/* State Layer - Show field condition */}
                {layers.state && (
                  <div className="ml-7 text-xs font-mono text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-700">
                    State: Submit button stays disabled until user checks this box
                  </div>
                )}

                {/* Signal Layer - Show event flow */}
                {layers.signal && (
                  <div className="ml-7 text-xs font-mono text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded border border-cyan-700">
                    Signal: Checkbox publishes "terms-agreed" event → Submit button receives event and enables
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                disabled={isSubmitDisabled}
                className={`w-full py-3 font-semibold transition-all ${
                  layers.style
                    ? `${
                        isSubmitDisabled
                          ? "bg-slate-700 text-slate-500 cursor-not-allowed rounded-lg"
                          : "bg-blue-500 text-white hover:bg-blue-500 active:scale-95 rounded-lg"
                      }`
                    : `${
                        isSubmitDisabled
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                          : "bg-slate-700 text-slate-100 hover:bg-slate-600 active:scale-95"
                      }`
                }`}
              >
                {layers.schema ? "Submit" : "Button"}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
