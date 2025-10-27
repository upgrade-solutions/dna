"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dna,
  ArrowRight,
  Building2,
  Upload,
  Mic,
  FileText,
  Video,
  Sparkles,
  Download,
  FileCode,
  Database,
  Code,
  FolderIcon,
  UserIcon,
  HandshakeIcon,
  BriefcaseIcon,
  Banknote,
  Shield,
  BarChart3,
} from "lucide-react"
// Product name to icon mapping
const productIconMap: Record<string, JSX.Element> = {
  "Loan Platform": <FolderIcon className="w-8 h-8 text-primary" />,
  "Banking Core": <Banknote className="w-8 h-8 text-primary" />,
  "Insurance Platform": <Shield className="w-8 h-8 text-primary" />,
  "Claims Portal": <BriefcaseIcon className="w-8 h-8 text-primary" />,
  "Investment Portal": <BarChart3 className="w-8 h-8 text-primary" />,
  "Portfolio Analytics": <BarChart3 className="w-8 h-8 text-primary" />,
};

function getProductIcon(name: string) {
  return productIconMap[name] || <FolderIcon className="w-8 h-8 text-primary" />;
}

const organizations = [
  {
    id: "org1",
    name: "Financial Services Division",
    description: "Consumer and commercial banking products",
  },
  {
    id: "org2",
    name: "Insurance Group",
    description: "Life, health, and property insurance products",
  },
  {
    id: "org3",
    name: "Investment Management",
    description: "Wealth management and trading platforms",
  },
]

const products = [
  { id: "1", name: "Loan Platform", workflowCount: 5, organizationId: "org1" },
  { id: "2", name: "Banking Core", workflowCount: 12, organizationId: "org1" },
  { id: "3", name: "Insurance Platform", workflowCount: 8, organizationId: "org2" },
  { id: "4", name: "Claims Portal", workflowCount: 5, organizationId: "org2" },
  { id: "5", name: "Investment Portal", workflowCount: 9, organizationId: "org3" },
  { id: "6", name: "Portfolio Analytics", workflowCount: 6, organizationId: "org3" },
]

export default function Dashboard() {
  const handleViewOrganizations = () => {
    window.location.href = "/"
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Top Bar */}
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dna className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">DNA Studio</span>
        </div>
        <Badge variant="outline" className="text-xs">
          Process Overview
        </Badge>
      </header>

      {/* Process Flow View */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Product Cards with icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {products.map((product) => (
              <Card key={product.id} className="p-6 bg-card border-border">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-shrink-0">
                    {getProductIcon(product.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">{product.name}
                      <Badge variant="secondary" className="ml-2">v1.0.0</Badge>
                    </h3>
                    <span className="text-xs text-muted-foreground">{product.workflowCount} Workflows</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">End-to-end platform.</p>
                {/* Add more product details here if needed */}
              </Card>
            ))}
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">DNA Studio Process</h1>
            <p className="text-muted-foreground">
              Transform business requirements into structured DNA schemas through intelligent processing
            </p>
          </div>

          {/* Process Flow Visualization */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Input Stage */}
            <Card className="p-6 bg-card border-border">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Intake</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Capture business requirements from multiple sources
                </p>
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
                    <Mic className="h-4 w-4 text-blue-400" />
                    <span className="text-xs">Audio Recordings</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="text-xs">Transcripts</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
                    <Video className="h-4 w-4 text-blue-400" />
                    <span className="text-xs">Video Meetings</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="text-xs">Documents</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Processing Stage */}
            <Card className="p-6 bg-card border-border border-primary/50">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4">
                  <Dna className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">DNA Processing</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  AI-powered extraction and structuring into DNA schemas
                </p>
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-2 p-2 rounded bg-primary/10 border border-primary/30">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs">Extract Workflows</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-primary/10 border border-primary/30">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs">Identify Steps</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-primary/10 border border-primary/30">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs">Define Actors</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-primary/10 border border-primary/30">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs">Map Resources</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Output Stage */}
            <Card className="p-6 bg-card border-border">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-4">
                  <Download className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Output</h3>
                <p className="text-sm text-muted-foreground mb-4">Structured DNA schemas ready for implementation</p>
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
                    <FileCode className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs">JSON Schemas</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
                    <Database className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs">Database Models</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
                    <Code className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs">API Definitions</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/50">
                    <FileText className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs">Documentation</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Flow Arrows */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Intake</span>
              <ArrowRight className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">DNA Processing</span>
              <ArrowRight className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Output</span>
            </div>
          </div>

          {/* Call to Action */}
          <Card className="p-8 bg-card border-border text-center">
            <h3 className="text-xl font-semibold mb-2">View Existing DNA Schemas</h3>
            <p className="text-muted-foreground mb-6">
              Explore organizations, products, workflows, and steps that have been processed through DNA Studio
            </p>
            <Button size="lg" onClick={handleViewOrganizations} className="gap-2">
              <Building2 className="h-4 w-4" />
              View Organizations
            </Button>
          </Card>

          {/* Process Stats */}
          <div className="grid grid-cols-3 gap-6 mt-8">
            <Card className="p-6 bg-card border-border">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{organizations.length}</div>
                <div className="text-sm text-muted-foreground">Organizations</div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-border">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{products.length}</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-border">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {products.reduce((acc, p) => acc + p.workflowCount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Workflows</div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
