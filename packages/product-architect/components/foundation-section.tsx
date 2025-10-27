"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Building2, FileText, Palette, Brain } from "lucide-react"

interface FoundationSectionProps {
  onFoundationClick?: (foundation: string) => void
  selectedFoundation?: string | null
}

export function FoundationSection({ onFoundationClick, selectedFoundation }: FoundationSectionProps) {
  const foundations = [
    {
      title: "Structure",
      icon: Building2,
      description: "Defines entities, relationships, hierarchies",
      details: "Organizational patterns and data architecture",
      id: "structure"
    },
    {
      title: "Specification",
      icon: FileText,
      description: "Defines data models, APIs, and logic", 
      details: "Technical blueprints and specifications",
      id: "specification"
    },
    {
      title: "Style",
      icon: Palette,
      description: "Defines UI, UX, and visual patterns",
      details: "Design systems and user experience",
      id: "style"
    },
    {
      title: "Semantics",
      icon: Brain,
      description: "Defines intent, rules, and ontology",
      details: "Business logic and domain knowledge",
      id: "semantics"
    }
  ]

  const handleFoundationClick = (foundation: typeof foundations[0]) => {
    onFoundationClick?.(foundation.id)
  }

  return (
    <section className="border-b border-border bg-muted/30 py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              The Foundation
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Four foundational elements that define every aspect of your product
            </p>
          </div>

          {/* Foundation Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {foundations.map((foundation, index) => {
              const isSelected = selectedFoundation === foundation.id
              return (
                <Card 
                  key={foundation.title}
                  className={`group relative overflow-hidden border backdrop-blur-sm transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20' 
                      : 'border-border/50 bg-background/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10'
                  }`}
                  onClick={() => handleFoundationClick(foundation)}
                >
                  <CardContent className="p-6">
                    <div className={`mb-4 transition-transform duration-200 ${
                      isSelected ? 'scale-110' : 'group-hover:scale-110'
                    }`}>
                      <foundation.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className={`mb-2 text-xl font-semibold transition-colors ${
                      isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
                    }`}>
                      {foundation.title}
                    </h3>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {foundation.description}
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                      {foundation.details}
                    </p>
                    
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute bottom-4 right-4">
                        <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                      </div>
                    )}
                    
                    {/* Click indicator */}
                    {!isSelected && (
                      <div className="absolute bottom-4 right-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                    
                    {/* Decorative element */}
                    <div className={`absolute -right-2 -top-2 h-8 w-8 rounded-full transition-all duration-300 ${
                      isSelected ? 'bg-primary/20' : 'bg-primary/5 group-hover:bg-primary/10'
                    }`} />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}