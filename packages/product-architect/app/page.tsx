"use client"

import { useState } from "react"
import { Building2, FileText, Palette, Brain } from "lucide-react"
import { Hero } from "@/components/hero"
import { FoundationSection } from "@/components/foundation-section"
import { UIBlueprintSection } from "@/components/ui-blueprint-section"
import { APIBlueprintSection } from "@/components/api-blueprint-section"
import { DatabaseBlueprintSection } from "@/components/database-blueprint-section"
import { ArchitectureBlueprintSection } from "@/components/architecture-blueprint-section"
import { StructureBlueprintSection } from "@/components/structure-blueprint-section"
import { StyleBlueprintSection } from "@/components/style-blueprint-section"
import { TokensBlueprintSection } from "@/components/tokens-blueprint-section"
import { ThemeBlueprintSection } from "@/components/theme-blueprint-section"
import { ComponentsBlueprintSection } from "@/components/components-blueprint-section"
import { SemanticsBlueprintSection } from "@/components/semantics-blueprint-section"
import { Footer } from "@/components/footer"

export default function Home() {
  const [selectedFoundation, setSelectedFoundation] = useState<string | null>(null)

  const handleFoundationClick = (foundation: string) => {
    setSelectedFoundation(foundation)
  }

  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <FoundationSection 
        onFoundationClick={handleFoundationClick}
        selectedFoundation={selectedFoundation}
      />
      
      {/* Specifications Section */}
      {selectedFoundation === 'specification' && (
        <section id="specifications-section" className="py-16">
          <div className="container mx-auto px-4 mb-12">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <FileText className="h-4 w-4" />
                Specifications
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Technical Blueprints
              </h2>
              <p className="text-lg text-muted-foreground">
                Comprehensive specifications that define your product's technical foundation
              </p>
            </div>
          </div>
          
          <UIBlueprintSection />
          <APIBlueprintSection />
          <DatabaseBlueprintSection />
          <ArchitectureBlueprintSection />
        </section>
      )}

      {/* Structure Section */}
      {selectedFoundation === 'structure' && (
        <section id="structure-section" className="py-16">
          <div className="container mx-auto px-4 mb-12">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Building2 className="h-4 w-4" />
                Structure
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Organizational Architecture
              </h2>
              <p className="text-lg text-muted-foreground">
                Define entities, relationships, and hierarchical structures for your product ecosystem
              </p>
            </div>
          </div>
          
          <StructureBlueprintSection />
        </section>
      )}

      {/* Style Section */}
      {selectedFoundation === 'style' && (
        <section id="style-section" className="py-16">
          <div className="container mx-auto px-4 mb-12">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Palette className="h-4 w-4" />
                Style
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Design Systems
              </h2>
              <p className="text-lg text-muted-foreground">
                UI, UX, and visual patterns that define your product's look and feel
              </p>
            </div>
          </div>
          
          <StyleBlueprintSection />
          <TokensBlueprintSection />
          <ThemeBlueprintSection />
          <ComponentsBlueprintSection />
        </section>
      )}

      {/* Semantics Section */}
      {selectedFoundation === 'semantics' && (
        <SemanticsBlueprintSection />
      )}
      
      <Footer />
    </main>
  )
}
