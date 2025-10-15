"use client"

import { IntakeSession } from "@/components/intake-session"

export default function IntakePage() {
  const handleBack = () => {
    window.location.href = "/"
  }

  const handleSave = (data: any) => {
    console.log("Saving intake session:", data)
    // In a real app, you would save to localStorage or send to server
  }

  const handleSubmit = (data: any) => {
    console.log("Submitting intake session for DNA processing:", data)
    // In a real app, you would send to the processing API
  }

  return (
    <IntakeSession 
      onBack={handleBack}
      onSave={handleSave}
      onSubmit={handleSubmit}
    />
  )
}
