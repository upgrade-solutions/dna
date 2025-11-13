import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { HeroBlueprintBackground } from "./hero-blueprint-background"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 opacity-70">
        <HeroBlueprintBackground />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="container relative mx-auto px-4 py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance">
            Product Architect
          </h1>

          <p className="mb-12 text-lg leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl text-balance">
            {"Living blueprints for business applications"}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="group">
              {"Get Started"}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline">
              {"View Documentation"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
