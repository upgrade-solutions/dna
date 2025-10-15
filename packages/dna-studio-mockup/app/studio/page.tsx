"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dna,
  Circle,
  ChevronRight,
  ArrowLeft,
  Folder,
  User,
  Zap,
  Database,
  ArrowRight,
  Building2,
  ChevronDown,
  Plus,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Import data utilities
import {
  getOrganizations,
  getProducts,
  getStatusColors,
  type Organization,
  type Product,
  type Workflow,
  type Step,
  type Project,
  type ProjectStatus,
  type WorkflowStatus,
} from "@/lib/data"

type ViewMode = "Product" | "Project"
type ViewLevel = "organizations" | "product" | "step"

const organizations: Organization[] = getOrganizations()
const products: Product[] = getProducts()
const { projectStatus: statusColors, productStatus: productStatusColors, workflowStatus: workflowStatusColors } = getStatusColors()

export default function DNAStudio() {
  const [viewLevel, setViewLevel] = useState<ViewLevel>("organizations")
  const [selectedOrganization, setSelectedOrganization] = useState<Organization>(organizations[0])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("Product")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedStep, setSelectedStep] = useState<{ step: Step; workflow: Workflow } | null>(null)
  const [isAddStepDialogOpen, setIsAddStepDialogOpen] = useState(false)
  const [selectedWorkflowForNewStep, setSelectedWorkflowForNewStep] = useState<string | null>(null)
  const [newStepForm, setNewStepForm] = useState({
    actor: "",
    action: "",
    resource: "",
    status: "Active" as WorkflowStatus,
  })
  const [productsList, setProductsList] = useState<Product[]>(products)

  const filteredProducts = productsList.filter((p) => p.organizationId === selectedOrganization.id)

  const currentProduct = productsList.find((p) => p.id === selectedProduct?.id) || selectedProduct

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setViewMode("Project")
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setViewMode("Product")
    setSelectedProject(null)
    setSelectedStep(null)
    setViewLevel("product")
  }

  const handleBackToProducts = () => {
    setSelectedProduct(null)
    setViewMode("Product")
    setSelectedProject(null)
    setSelectedStep(null)
    setViewLevel("organizations")
  }

  const handleOrganizationChange = (org: Organization) => {
    setSelectedOrganization(org)
    setSelectedProduct(null)
    setViewMode("Product")
    setSelectedProject(null)
    setSelectedStep(null)
  }

  const handleStepClick = (step: Step, workflow: Workflow) => {
    setSelectedStep({ step, workflow })
    setViewLevel("step")
  }

  const handleBackToWorkflows = () => {
    setSelectedStep(null)
    setViewLevel("product")
  }

  const handleViewOrganizations = () => {
    setViewLevel("organizations")
    setSelectedProduct(null)
    setSelectedStep(null)
  }

  const handleBackToProcess = () => {
    window.location.href = "/dashboard"
  }

  const handleAddStepClick = (workflowId: string) => {
    setSelectedWorkflowForNewStep(workflowId)
    setNewStepForm({
      actor: "",
      action: "",
      resource: "",
      status: "Active",
    })
    setIsAddStepDialogOpen(true)
  }

  const handleAddStepSubmit = () => {
    if (!selectedWorkflowForNewStep || !currentProduct) return

    // Validate form
    if (!newStepForm.actor || !newStepForm.action || !newStepForm.resource) {
      alert("Please fill in all required fields")
      return
    }

    // Create new step with unique ID
    const newStep: Step = {
      id: `s${Date.now()}`,
      actor: newStepForm.actor,
      action: newStepForm.action,
      resource: newStepForm.resource,
      status: newStepForm.status,
    }

    // Update products list with new step
    setProductsList((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === currentProduct.id) {
          return {
            ...product,
            workflows: product.workflows.map((workflow) => {
              if (workflow.id === selectedWorkflowForNewStep) {
                return {
                  ...workflow,
                  steps: [...workflow.steps, newStep],
                }
              }
              return workflow
            }),
          }
        }
        return product
      }),
    )

    // Update selected product
    if (currentProduct) {
      const updatedProduct = {
        ...currentProduct,
        workflows: currentProduct.workflows.map((workflow) => {
          if (workflow.id === selectedWorkflowForNewStep) {
            return {
              ...workflow,
              steps: [...workflow.steps, newStep],
            }
          }
          return workflow
        }),
      }
      setSelectedProduct(updatedProduct)
    }

    // Close dialog and reset form
    setIsAddStepDialogOpen(false)
    setSelectedWorkflowForNewStep(null)
    setNewStepForm({
      actor: "",
      action: "",
      resource: "",
      status: "Active",
    })
  }

  const activeWorkflows =
    viewMode === "Project" && selectedProject
      ? currentProduct?.workflows.filter((wf) => selectedProject.workflows.includes(wf.id)) || []
      : currentProduct?.workflows || []

  // Moved useState calls outside the conditional block
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  if (selectedStep) {
    const { step, workflow } = selectedStep

    const validateField = (fieldName: string, value: any, resource: string): string => {
      switch (resource) {
        case "Registration Form":
          if (fieldName === "email") {
            if (!value) return "Email is required"
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(value)) return "Must be a valid email format"
            if (value.length > 255) return "Email must be less than 255 characters"
          }
          if (fieldName === "password") {
            if (!value) return "Password is required"
            if (value.length < 8) return "Password must be at least 8 characters"
            if (value.length > 128) return "Password must be less than 128 characters"
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
              return "Must contain uppercase, lowercase, number, and special character"
            }
          }
          if (fieldName === "firstName" || fieldName === "lastName") {
            if (!value) return `${fieldName === "firstName" ? "First" : "Last"} name is required`
            if (value.length < 1 || value.length > 50) return "Must be between 1 and 50 characters"
            if (!/^[a-zA-Z\s]+$/.test(value)) return "Only alphabetic characters and spaces allowed"
          }
          if (fieldName === "phone") {
            if (!value) return "Phone number is required"
            const phoneRegex = /^\+?[1-9]\d{9,14}$/
            if (!phoneRegex.test(value.replace(/[\s()-]/g, ""))) {
              return "Must be a valid international phone number"
            }
          }
          if (fieldName === "dob") {
            if (!value) return "Date of birth is required"
            const birthDate = new Date(value)
            const today = new Date()
            const age = today.getFullYear() - birthDate.getFullYear()
            if (age < 18) return "Must be at least 18 years old"
            if (age > 120) return "Invalid date of birth"
          }
          break

        case "Loan Application":
          if (fieldName === "loanAmount") {
            if (!value) return "Loan amount is required"
            const amount = Number.parseFloat(value)
            if (amount < 1000) return "Minimum loan amount is $1,000"
            if (amount > 500000) return "Maximum loan amount is $500,000"
            if (amount % 100 !== 0) return "Loan amount must be a multiple of $100"
          }
          if (fieldName === "loanPurpose") {
            if (!value) return "Loan purpose is required"
            if (value.length < 10) return "Please provide at least 10 characters"
            if (value.length > 500) return "Maximum 500 characters"
          }
          if (fieldName === "annualIncome") {
            if (!value) return "Annual income is required"
            const income = Number.parseFloat(value)
            if (income < 0) return "Income must be a positive number"
            if (income > 10000000) return "Please enter a valid income"
          }
          if (fieldName === "yearsEmployed") {
            if (value === "") return "Years employed is required"
            const years = Number.parseFloat(value)
            if (years < 0) return "Years must be 0 or greater"
            if (years > 50) return "Please enter a valid number of years"
          }
          break

        case "Payment":
          if (fieldName === "paymentAmount") {
            if (!value) return "Payment amount is required"
            const amount = Number.parseFloat(value)
            if (amount < 0.01) return "Minimum payment is $0.01"
            if (amount > 100000) return "Maximum payment is $100,000"
            if (!/^\d+(\.\d{1,2})?$/.test(value)) return "Amount must have at most 2 decimal places"
          }
          if (fieldName === "accountNumber") {
            if (!value) return "Account number is required"
            if (!/^\d+$/.test(value)) return "Account number must be numeric"
            if (value.length < 8 || value.length > 17) return "Account number must be 8-17 digits"
          }
          if (fieldName === "routingNumber") {
            if (!value) return "Routing number is required"
            if (!/^\d{9}$/.test(value)) return "Routing number must be exactly 9 digits"
          }
          break

        case "Identity Documents":
          if (fieldName === "idNumber") {
            if (!value) return "ID number is required"
            if (value.length < 5 || value.length > 20) return "ID number must be 5-20 characters"
          }
          if (fieldName === "expirationDate") {
            if (!value) return "Expiration date is required"
            const expDate = new Date(value)
            const today = new Date()
            if (expDate <= today) return "ID must not be expired"
            const yearsDiff = expDate.getFullYear() - today.getFullYear()
            if (yearsDiff > 10) return "Expiration date seems invalid"
          }
          break
      }
      return ""
    }

    const handleFieldChange = (fieldName: string, value: any) => {
      setFormData((prev) => ({ ...prev, [fieldName]: value }))
      // Clear error when user starts typing
      if (formErrors[fieldName]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[fieldName]
          return newErrors
        })
      }
    }

    const handleFieldBlur = (fieldName: string, resource: string) => {
      const value = formData[fieldName]
      const error = validateField(fieldName, value, resource)
      if (error) {
        setFormErrors((prev) => ({ ...prev, [fieldName]: error }))
      }
    }

    const handleSubmit = (e: React.FormEvent, resource: string) => {
      e.preventDefault()
      // Validate all fields
      const errors: Record<string, string> = {}
      Object.keys(formData).forEach((fieldName) => {
        const error = validateField(fieldName, formData[fieldName], resource)
        if (error) errors[fieldName] = error
      })
      setFormErrors(errors)

      if (Object.keys(errors).length === 0) {
        console.log("[v0] Form submitted successfully:", formData)
        alert("Form validated successfully!")
      }
    }

    const getResourceFormData = (resource: string) => {
      switch (resource) {
        case "Registration Form":
          return {
            formFields: (
              <form onSubmit={(e) => handleSubmit(e, resource)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email || ""}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    onBlur={() => handleFieldBlur("email", resource)}
                    className={formErrors.email ? "border-red-500" : ""}
                  />
                  {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password || ""}
                    onChange={(e) => handleFieldChange("password", e.target.value)}
                    onBlur={() => handleFieldBlur("password", resource)}
                    className={formErrors.password ? "border-red-500" : ""}
                  />
                  {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName || ""}
                      onChange={(e) => handleFieldChange("firstName", e.target.value)}
                      onBlur={() => handleFieldBlur("firstName", resource)}
                      className={formErrors.firstName ? "border-red-500" : ""}
                    />
                    {formErrors.firstName && <p className="text-xs text-red-500">{formErrors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName || ""}
                      onChange={(e) => handleFieldChange("lastName", e.target.value)}
                      onBlur={() => handleFieldBlur("lastName", resource)}
                      className={formErrors.lastName ? "border-red-500" : ""}
                    />
                    {formErrors.lastName && <p className="text-xs text-red-500">{formErrors.lastName}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone || ""}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    onBlur={() => handleFieldBlur("phone", resource)}
                    className={formErrors.phone ? "border-red-500" : ""}
                  />
                  {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob || ""}
                    onChange={(e) => handleFieldChange("dob", e.target.value)}
                    onBlur={() => handleFieldBlur("dob", resource)}
                    className={formErrors.dob ? "border-red-500" : ""}
                  />
                  {formErrors.dob && <p className="text-xs text-red-500">{formErrors.dob}</p>}
                </div>
                <div className="space-y-3">
                  <Label>Address</Label>
                  <div className="space-y-3 pl-4 border-l-2 border-border">
                    <Input placeholder="Street Address" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="City" />
                      <Input placeholder="State" />
                    </div>
                    <Input placeholder="ZIP Code" />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="marketing" />
                  <label htmlFor="marketing" className="text-sm text-muted-foreground leading-none">
                    I agree to receive marketing communications
                  </label>
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Submit Registration
                </Button>
              </form>
            ),
            attributes: [
              { name: "email", type: "String", required: true },
              { name: "password", type: "String", required: true },
              { name: "firstName", type: "String", required: true },
              { name: "lastName", type: "String", required: true },
              { name: "phoneNumber", type: "String", required: true },
              { name: "dateOfBirth", type: "Date", required: true },
              { name: "address", type: "Object", required: true },
              { name: "marketingConsent", type: "Boolean", required: false },
            ],
            validations: [
              {
                field: "email",
                rules: ["Format: Email", "Max Length: 255", "Unique"],
                description: "Must be a valid email format and unique in the system",
              },
              {
                field: "password",
                rules: ["Min Length: 8", "Max Length: 128", "Pattern: Complex"],
                description: "Must contain uppercase, lowercase, number, and special character",
              },
              {
                field: "firstName",
                rules: ["Min Length: 1", "Max Length: 50", "Pattern: Alpha"],
                description: "Only alphabetic characters and spaces allowed",
              },
              {
                field: "lastName",
                rules: ["Min Length: 1", "Max Length: 50", "Pattern: Alpha"],
                description: "Only alphabetic characters and spaces allowed",
              },
              {
                field: "phoneNumber",
                rules: ["Format: E.164", "Length: 10-15"],
                description: "Must be a valid international phone number format",
              },
              {
                field: "dateOfBirth",
                rules: ["Min Age: 18", "Max Age: 120", "Format: ISO 8601"],
                description: "Customer must be at least 18 years old",
              },
              {
                field: "address",
                rules: ["Required Fields: street, city, state, zipCode", "Validation: US Address"],
                description: "Must be a valid US postal address",
              },
            ],
          }

        case "Loan Application":
          return {
            formFields: (
              <form onSubmit={(e) => handleSubmit(e, resource)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Requested Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    placeholder="50000"
                    value={formData.loanAmount || ""}
                    onChange={(e) => handleFieldChange("loanAmount", e.target.value)}
                    onBlur={() => handleFieldBlur("loanAmount", resource)}
                    className={formErrors.loanAmount ? "border-red-500" : ""}
                  />
                  {formErrors.loanAmount && <p className="text-xs text-red-500">{formErrors.loanAmount}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanPurpose">Loan Purpose</Label>
                  <Input
                    id="loanPurpose"
                    placeholder="Home improvement"
                    value={formData.loanPurpose || ""}
                    onChange={(e) => handleFieldChange("loanPurpose", e.target.value)}
                    onBlur={() => handleFieldBlur("loanPurpose", resource)}
                    className={formErrors.loanPurpose ? "border-red-500" : ""}
                  />
                  {formErrors.loanPurpose && <p className="text-xs text-red-500">{formErrors.loanPurpose}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status</Label>
                  <Input id="employmentStatus" placeholder="Full-time" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Income</Label>
                  <Input
                    id="annualIncome"
                    type="number"
                    placeholder="75000"
                    value={formData.annualIncome || ""}
                    onChange={(e) => handleFieldChange("annualIncome", e.target.value)}
                    onBlur={() => handleFieldBlur("annualIncome", resource)}
                    className={formErrors.annualIncome ? "border-red-500" : ""}
                  />
                  {formErrors.annualIncome && <p className="text-xs text-red-500">{formErrors.annualIncome}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employerName">Employer Name</Label>
                  <Input id="employerName" placeholder="Acme Corporation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsEmployed">Years at Current Employer</Label>
                  <Input
                    id="yearsEmployed"
                    type="number"
                    placeholder="3"
                    value={formData.yearsEmployed || ""}
                    onChange={(e) => handleFieldChange("yearsEmployed", e.target.value)}
                    onBlur={() => handleFieldBlur("yearsEmployed", resource)}
                    className={formErrors.yearsEmployed ? "border-red-500" : ""}
                  />
                  {formErrors.yearsEmployed && <p className="text-xs text-red-500">{formErrors.yearsEmployed}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
                  <Input id="monthlyExpenses" type="number" placeholder="2500" />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Submit Loan Application
                </Button>
              </form>
            ),
            attributes: [
              { name: "loanAmount", type: "Number", required: true },
              { name: "loanPurpose", type: "String", required: true },
              { name: "employmentStatus", type: "String", required: true },
              { name: "annualIncome", type: "Number", required: true },
              { name: "employerName", type: "String", required: true },
              { name: "yearsEmployed", type: "Number", required: true },
              { name: "monthlyExpenses", type: "Number", required: true },
            ],
            validations: [
              {
                field: "loanAmount",
                rules: ["Min: 1000", "Max: 500000", "Multiple of: 100"],
                description: "Loan amount must be between $1,000 and $500,000",
              },
              {
                field: "loanPurpose",
                rules: ["Min Length: 10", "Max Length: 500"],
                description: "Provide a clear description of loan purpose",
              },
              {
                field: "annualIncome",
                rules: ["Min: 0", "Max: 10000000"],
                description: "Annual income must be a positive number",
              },
              {
                field: "yearsEmployed",
                rules: ["Min: 0", "Max: 50"],
                description: "Years employed at current employer",
              },
            ],
          }

        case "Income Documents":
          return {
            formFields: (
              <>
                <div className="space-y-2">
                  <Label>Pay Stubs (Last 3 months)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground">Drag and drop files or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB each</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>W-2 Forms (Last 2 years)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground">Drag and drop files or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB each</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tax Returns (Last 2 years)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground">Drag and drop files or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF up to 10MB each</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Input id="additionalNotes" placeholder="Any additional income sources..." />
                </div>
                <Button className="w-full" size="lg">
                  Submit Documents
                </Button>
              </>
            ),
            attributes: [
              { name: "payStubs", type: "File[]", required: true },
              { name: "w2Forms", type: "File[]", required: true },
              { name: "taxReturns", type: "File[]", required: true },
              { name: "additionalNotes", type: "String", required: false },
              { name: "uploadedDate", type: "DateTime", required: true },
            ],
            validations: [
              {
                field: "payStubs",
                rules: ["Min Files: 3", "Max Files: 6", "File Types: PDF, JPG, PNG", "Max Size: 10MB"],
                description: "Must upload at least 3 recent pay stubs",
              },
              {
                field: "w2Forms",
                rules: ["Min Files: 2", "Max Files: 2", "File Types: PDF", "Max Size: 10MB"],
                description: "Must upload W-2 forms for last 2 years",
              },
              {
                field: "taxReturns",
                rules: ["Min Files: 2", "Max Files: 2", "File Types: PDF", "Max Size: 10MB"],
                description: "Must upload complete tax returns for last 2 years",
              },
            ],
          }

        case "Payment":
          return {
            formFields: (
              <form onSubmit={(e) => handleSubmit(e, resource)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="paymentAmount">Payment Amount</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    placeholder="500.00"
                    value={formData.paymentAmount || ""}
                    onChange={(e) => handleFieldChange("paymentAmount", e.target.value)}
                    onBlur={() => handleFieldBlur("paymentAmount", resource)}
                    className={formErrors.paymentAmount ? "border-red-500" : ""}
                  />
                  {formErrors.paymentAmount && <p className="text-xs text-red-500">{formErrors.paymentAmount}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Input id="paymentMethod" placeholder="Bank Account" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="12345678"
                    value={formData.accountNumber || ""}
                    onChange={(e) => handleFieldChange("accountNumber", e.target.value)}
                    onBlur={() => handleFieldBlur("accountNumber", resource)}
                    className={formErrors.accountNumber ? "border-red-500" : ""}
                  />
                  {formErrors.accountNumber && <p className="text-xs text-red-500">{formErrors.accountNumber}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    placeholder="021000021"
                    value={formData.routingNumber || ""}
                    onChange={(e) => handleFieldChange("routingNumber", e.target.value)}
                    onBlur={() => handleFieldBlur("routingNumber", resource)}
                    className={formErrors.routingNumber ? "border-red-500" : ""}
                  />
                  {formErrors.routingNumber && <p className="text-xs text-red-500">{formErrors.routingNumber}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input id="paymentDate" type="date" />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Process Payment
                </Button>
              </form>
            ),
            attributes: [
              { name: "paymentAmount", type: "Number", required: true },
              { name: "paymentMethod", type: "String", required: true },
              { name: "accountNumber", type: "String", required: true },
              { name: "routingNumber", type: "String", required: true },
              { name: "paymentDate", type: "Date", required: true },
            ],
            validations: [
              {
                field: "paymentAmount",
                rules: ["Min: 0.01", "Max: 100000", "Decimal Places: 2"],
                description: "Payment amount must be positive and up to 2 decimal places",
              },
              {
                field: "accountNumber",
                rules: ["Length: 8-17", "Pattern: Numeric"],
                description: "Valid bank account number",
              },
              {
                field: "routingNumber",
                rules: ["Length: 9", "Pattern: Numeric", "Validation: ABA"],
                description: "Valid 9-digit ABA routing number",
              },
            ],
          }

        case "Identity Documents":
          return {
            formFields: (
              <form onSubmit={(e) => handleSubmit(e, resource)} className="space-y-6">
                <div className="space-y-2">
                  <Label>Government-Issued ID</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground">Upload Driver's License or Passport</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idType">ID Type</Label>
                  <Input id="idType" placeholder="Driver's License" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input
                    id="idNumber"
                    placeholder="D1234567"
                    value={formData.idNumber || ""}
                    onChange={(e) => handleFieldChange("idNumber", e.target.value)}
                    onBlur={() => handleFieldBlur("idNumber", resource)}
                    className={formErrors.idNumber ? "border-red-500" : ""}
                  />
                  {formErrors.idNumber && <p className="text-xs text-red-500">{formErrors.idNumber}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={formData.expirationDate || ""}
                    onChange={(e) => handleFieldChange("expirationDate", e.target.value)}
                    onBlur={() => handleFieldBlur("expirationDate", resource)}
                    className={formErrors.expirationDate ? "border-red-500" : ""}
                  />
                  {formErrors.expirationDate && <p className="text-xs text-red-500">{formErrors.expirationDate}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuingState">Issuing State/Country</Label>
                  <Input id="issuingState" placeholder="California" />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Submit for Review
                </Button>
              </form>
            ),
            attributes: [
              { name: "documentFile", type: "File", required: true },
              { name: "idType", type: "String", required: true },
              { name: "idNumber", type: "String", required: true },
              { name: "expirationDate", type: "Date", required: true },
              { name: "issuingAuthority", type: "String", required: true },
            ],
            validations: [
              {
                field: "documentFile",
                rules: ["File Types: PDF, JPG, PNG", "Max Size: 10MB", "Min Resolution: 300 DPI"],
                description: "Clear, legible scan or photo of government-issued ID",
              },
              {
                field: "expirationDate",
                rules: ["Must be: Future Date", "Max Years: 10"],
                description: "ID must not be expired",
              },
              {
                field: "idNumber",
                rules: ["Min Length: 5", "Max Length: 20"],
                description: "Valid ID number format",
              },
            ],
          }

        default:
          return {
            formFields: (
              <div className="text-center py-8 text-muted-foreground">
                <p>No form preview available for this resource type</p>
                <p className="text-sm mt-2">Resource: {resource}</p>
              </div>
            ),
            attributes: [{ name: "data", type: "Object", required: true }],
            validations: [
              {
                field: "data",
                rules: ["Format: JSON"],
                description: "Valid data structure required",
              },
            ],
          }
      }
    }

    const resourceData = getResourceFormData(step.resource)

    return (
      <div className="h-screen flex flex-col bg-background text-foreground">
        {/* Top Bar */}
        <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToWorkflows} className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Dna className="h-5 w-5 text-primary" />
              <button
                onClick={handleBackToProcess}
                className="breadcrumb font-semibold text-lg hover:text-primary"
              >
                DNA Studio
              </button>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <button
                onClick={handleBackToProducts}
                className="breadcrumb text-muted-foreground hover:text-primary transition-colors"
              >
                {selectedOrganization.name}
              </button>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={handleBackToWorkflows}
              className="breadcrumb text-muted-foreground hover:text-primary transition-colors"
            >
              {selectedProduct?.name}
            </button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{workflow.name}</span>
          </div>
        </header>

        {/* Step Detail View */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">Step Detail</h1>
                {step.status && (
                  <Badge variant="outline" className={`${workflowStatusColors[step.status]}`}>
                    {step.status}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">From workflow: {workflow.name}</p>
            </div>

            {/* DNA Base Pair Visualization */}
            <Card className="p-8 bg-card border-border mb-6">
              <div className="flex items-center justify-center gap-6">
                {/* Actor */}
                <div className="flex flex-col items-center gap-3 flex-1">
                  <div className="h-20 w-20 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center">
                    <User className="h-10 w-10 text-blue-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Actor</div>
                    <div className="text-xl font-semibold text-foreground">{step.actor}</div>
                  </div>
                </div>

                <ArrowRight className="h-8 w-8 text-muted-foreground flex-shrink-0" />

                {/* Action */}
                <div className="flex flex-col items-center gap-3 flex-1">
                  <div className="h-20 w-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
                    <Zap className="h-10 w-10 text-amber-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Action</div>
                    <div className="text-xl font-semibold text-foreground">{step.action}</div>
                  </div>
                </div>

                <ArrowRight className="h-8 w-8 text-muted-foreground flex-shrink-0" />

                {/* Resource */}
                <div className="flex flex-col items-center gap-3 flex-1">
                  <div className="h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                    <Database className="h-10 w-10 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Resource</div>
                    <div className="text-xl font-semibold text-foreground">{step.resource}</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step Metadata */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 bg-card border-border">
                <h3 className="font-semibold mb-4">Step Information</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Step ID</div>
                    <div className="text-sm font-mono text-foreground">{step.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Workflow</div>
                    <div className="text-sm text-foreground">{workflow.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Status</div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${step.status ? workflowStatusColors[step.status] : ""}`}
                    >
                      {step.status || "Active"}
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="font-semibold mb-4">Context</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Product</div>
                    <div className="text-sm text-foreground">{selectedProduct?.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Organization</div>
                    <div className="text-sm text-foreground">{selectedOrganization.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Workflow Status</div>
                    <Badge variant="outline" className={`text-xs ${workflowStatusColors[workflow.status]}`}>
                      {workflow.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sample Form Preview */}
            <Card className="mt-6 p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Form Preview</h3>
                <Badge variant="outline" className="text-xs">
                  {step.actor} View
                </Badge>
              </div>

              <div className="space-y-6 max-w-md">{resourceData.formFields}</div>
            </Card>

            {/* Step Attributes */}
            <Card className="mt-6 p-6 bg-card border-border">
              <h3 className="font-semibold mb-4">Attributes</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-xs font-medium text-muted-foreground border-b border-border pb-2">
                  <div>Field Name</div>
                  <div>Type</div>
                  <div>Required</div>
                </div>

                {resourceData.attributes.map((attr, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-3 gap-4 items-center py-2 ${
                      index < resourceData.attributes.length - 1 ? "border-b border-border/50" : ""
                    }`}
                  >
                    <div className="font-mono text-sm text-foreground">{attr.name}</div>
                    <div className="text-sm text-muted-foreground">{attr.type}</div>
                    <div className="flex items-center gap-2">
                      <Circle
                        className={`h-2 w-2 ${
                          attr.required ? "fill-emerald-400 text-emerald-400" : "fill-gray-400 text-gray-400"
                        }`}
                      />
                      <span className={`text-sm ${attr.required ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {attr.required ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Validations */}
            <Card className="mt-6 p-6 bg-card border-border">
              <h3 className="font-semibold mb-4">Validations</h3>
              <div className="space-y-4">
                {resourceData.validations.map((validation, index) => (
                  <div
                    key={index}
                    className={index < resourceData.validations.length - 1 ? "border-b border-border pb-4" : ""}
                  >
                    <div className="flex items-start gap-3">
                      <div className="font-mono text-sm text-foreground min-w-[140px]">{validation.field}</div>
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2">
                          {validation.rules.map((rule, ruleIndex) => {
                            const colors = [
                              "bg-blue-500/10 text-blue-400 border-blue-500/30",
                              "bg-amber-500/10 text-amber-400 border-amber-500/30",
                              "bg-purple-500/10 text-purple-400 border-purple-500/30",
                              "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                            ]
                            return (
                              <Badge
                                key={ruleIndex}
                                variant="outline"
                                className={`text-xs ${colors[ruleIndex % colors.length]}`}
                              >
                                {rule}
                              </Badge>
                            )
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{validation.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (!currentProduct) {
    return (
      <div className="h-screen flex flex-col bg-background text-foreground">
        {/* Top Bar */}
        <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToProcess} className="breadcrumb gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Dna className="h-5 w-5 text-primary" />
              <button
                onClick={handleBackToProcess}
                className="breadcrumb font-semibold text-lg hover:text-primary"
              >
                DNA Studio
              </button>
            </div>
            <div className="h-6 w-px bg-border" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="org-dropdown gap-2 h-9">
                  <Building2 className="h-4 w-4" />
                  <span>{selectedOrganization.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[300px]" sideOffset={4}>
                {organizations.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    onSelect={() => handleOrganizationChange(org)}
                    className="flex flex-col items-start gap-1 p-3"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">{org.name}</span>
                      {org.id === selectedOrganization.id && (
                        <Circle className="h-2 w-2 fill-primary text-primary ml-auto" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground pl-6">{org.description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {filteredProducts.length} Products
            </Badge>
          </div>
        </header>

        {/* Products List */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Products</h1>
              <p className="text-muted-foreground">
                {selectedOrganization.description} • Select a product to view its DNA graph and projects
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="p-6 bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Folder className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <Badge variant="outline" className={`text-xs mt-1 ${productStatusColors[product.status]}`}>
                          {product.status}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">{product.description}</p>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Projects</div>
                      <div className="text-2xl font-semibold text-foreground">{product.projectCount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Workflows</div>
                      <div className="text-2xl font-semibold text-foreground">{product.workflowCount}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Top Bar */}
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToProducts} className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-primary" />
            <button
              onClick={handleBackToProcess}
              className="breadcrumb font-semibold text-lg hover:text-primary transition-colors"
            >
              DNA Studio
            </button>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={handleBackToProducts}
              className="breadcrumb text-muted-foreground hover:text-primary transition-colors"
            >
              {selectedOrganization.name}
            </button>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{currentProduct.name}</span>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Processes</h1>
            <p className="text-muted-foreground">Workflows and steps defining the complete product</p>
          </div>

          <div className="space-y-6">
            {activeWorkflows.map((workflow) => {
              const isInSelectedProject = selectedProject?.workflows.includes(workflow.id)

              return (
                <Card key={workflow.id} className="p-6 bg-card border border-border">
                  {/* Workflow Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">{workflow.name}</h3>
                        <Badge variant="outline" className={`text-xs ${workflowStatusColors[workflow.status]}`}>
                          {workflow.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{workflow.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {workflow.steps.length} steps
                    </Badge>
                  </div>

                  {/* DNA Steps: Actor → Action → Resource */}
                  <div className="space-y-3">
                    {workflow.steps.map((step, index) => (
                      <div key={step.id}>
                        <button
                          onClick={() => handleStepClick(step, workflow)}
                          className="workflow-step w-full flex items-center gap-3 p-4 rounded-lg border bg-muted/30 border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer group"
                        >
                          {/* Step Number */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-medium text-muted-foreground group-hover:border-primary/50 transition-colors">
                            {index + 1}
                          </div>

                          {/* Actor */}
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <User className="h-4 w-4 text-blue-400" />
                            <div className="text-left">
                              <div className="text-xs text-muted-foreground">Actor</div>
                              <div className="text-sm font-medium text-foreground">{step.actor}</div>
                            </div>
                          </div>

                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                          {/* Action */}
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <Zap className="h-4 w-4 text-amber-400" />
                            <div className="text-left">
                              <div className="text-xs text-muted-foreground">Action</div>
                              <div className="text-sm font-medium text-foreground">{step.action}</div>
                            </div>
                          </div>

                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                          {/* Resource */}
                          <div className="flex items-center gap-2 flex-1">
                            <Database className="h-4 w-4 text-emerald-400" />
                            <div className="text-left">
                              <div className="text-xs text-muted-foreground">Resource</div>
                              <div className="text-sm font-medium text-foreground">{step.resource}</div>
                            </div>
                          </div>

                          {step.status && (
                            <Badge variant="outline" className={`text-xs ${workflowStatusColors[step.status]} ml-2`}>
                              {step.status}
                            </Badge>
                          )}

                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </button>

                        {/* Connection line between steps */}
                        {index < workflow.steps.length - 1 && (
                          <div className="flex justify-center py-1">
                            <div className="w-px h-4 bg-border" />
                          </div>
                        )}
                      </div>
                    ))}

                    <Dialog
                      open={isAddStepDialogOpen && selectedWorkflowForNewStep === workflow.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setIsAddStepDialogOpen(false)
                          setSelectedWorkflowForNewStep(null)
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <button
                          onClick={() => handleAddStepClick(workflow.id)}
                          className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer group mt-3"
                        >
                          <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                            Add Step
                          </span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Add New Step</DialogTitle>
                          <DialogDescription>
                            Create a new step in the {workflow.name} workflow. Define the Actor, Action, and Resource.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="actor">Actor *</Label>
                            <Input
                              id="actor"
                              placeholder="e.g., Customer, System, Loan Officer"
                              value={newStepForm.actor}
                              onChange={(e) => setNewStepForm({ ...newStepForm, actor: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">Who performs this action</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="action">Action *</Label>
                            <Input
                              id="action"
                              placeholder="e.g., Submit, Verify, Approve"
                              value={newStepForm.action}
                              onChange={(e) => setNewStepForm({ ...newStepForm, action: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">What operation is performed</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="resource">Resource *</Label>
                            <Input
                              id="resource"
                              placeholder="e.g., Application Form, Credit Report"
                              value={newStepForm.resource}
                              onChange={(e) => setNewStepForm({ ...newStepForm, resource: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">What data entity is involved</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={newStepForm.status}
                              onValueChange={(value: WorkflowStatus) =>
                                setNewStepForm({ ...newStepForm, status: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Planned">Planned</SelectItem>
                                <SelectItem value="In Review">In Review</SelectItem>
                                <SelectItem value="Deprecated">Deprecated</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddStepDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddStepSubmit}>Add Step</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Stats Summary */}
          <Card className="mt-6 p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">DNA Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {currentProduct.workflows.length} workflows with{" "}
                  {currentProduct.workflows.reduce((acc, wf) => acc + wf.steps.length, 0)} total steps
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-2 w-2 fill-amber-400 text-amber-400" />
                  <span className="text-sm text-muted-foreground">In Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-2 w-2 fill-blue-400 text-blue-400" />
                  <span className="text-sm text-muted-foreground">Planned</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />
                  <span className="text-sm text-muted-foreground">Deprecated</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
