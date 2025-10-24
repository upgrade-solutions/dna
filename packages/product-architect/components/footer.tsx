export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center md:text-left">
            <div className="text-xl font-bold text-foreground mb-2">{"Product Architect"}</div>
            <p className="text-sm text-muted-foreground">{"Living blueprints for business applications"}</p>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              {"Documentation"}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {"Examples"}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {"GitHub"}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {"Contact"}
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          {"© 2025 Product Architect. All rights reserved."}
        </div>
      </div>
    </footer>
  )
}
