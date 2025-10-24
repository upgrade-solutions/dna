import { Hero } from "@/components/hero"
import { UIBlueprintSection } from "@/components/ui-blueprint-section"
import { APIBlueprintSection } from "@/components/api-blueprint-section"
import { DatabaseBlueprintSection } from "@/components/database-blueprint-section"
import { ArchitectureBlueprintSection } from "@/components/architecture-blueprint-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <UIBlueprintSection />
      <APIBlueprintSection />
      <DatabaseBlueprintSection />
      <ArchitectureBlueprintSection />
      <Footer />
    </main>
  )
}
