# DNA Schemas

The DNA framework models business processes through a hierarchical structure of interconnected entities organized into two distinct layers. This document describes the key DNA entities and their relationships.

## Architecture Layers

The DNA framework operates on **two primary layers**:

### 1. Product Layer (Business Process Definition)
The **Product Layer** defines the permanent business structure and processes. This layer encompasses:
- **Organizations** - Top-level business entities
- **Products** - Long-lived business offerings and systems  
- **Workflows** - Stable business processes
- **Steps** - Atomic Actor→Action→Resource operations
- **Actors, Actions, Resources, Attributes** - Core business components

This layer represents the "DNA blueprint" of your organization - the enduring business processes that define how work gets done.

### 2. Project Layer (Change Management) 
The **Project Layer** manages modifications and improvements to the Product Layer. This layer encompasses:
- **Programs** - Strategic initiatives that coordinate multiple related projects
- **Projects** - Focused initiatives to modify workflows
- **Tasks** - Specific work items within projects

This layer represents the "evolution mechanism" - how your business processes adapt and improve over time through structured change management.

## Core DNA Entities

### Organization
The **Organization** sits at the top of the hierarchy and owns multiple products. It represents the highest-level business entity that encompasses all business operations, products, and processes.

### Products
**Products** are long-lived structures that represent major business offerings or systems within an organization. Examples include:
- Loan Origination System (LOS)
- Payments Platform
- Customer Portal

Each product contains multiple workflows that capture its business processes.

### Workflows
**Workflows** exist within each product and capture complete business processes as sequences of actions. They define:
- Ordered steps that must be executed
- Triggers that initiate the workflow
- Expected outputs and outcomes
- Parallel execution capabilities
- Conditional logic between steps

Example: A "Loan Application Approval Process" workflow might include steps for application submission, credit checks, income verification, underwriting, and final approval.

### Steps: The DNA Base Pairs (Actor > Operation)
**Steps** are the atomic building blocks of workflows—your DNA base pairs. Each step represents an Actor performing an Operation on a Resource.

Steps support **dual syntax** for maximum flexibility:

#### Explicit Syntax
```yaml
- key: apply_for_loan
  actor: borrower
  resource: loan
  action: apply
```

#### Dot Notation Syntax
```yaml
- key: apply_for_loan
  actor: borrower
  operation: loan.apply
```

#### Actor
Defines who or what performs the operation. Actors can be:
- **Users**: Individual people (e.g., borrowers, customers)
- **Roles**: Organizational positions (e.g., loan officers, managers)
- **Systems**: External or internal systems (e.g., credit bureau APIs, payment processors)
- **Agents**: Automated processes or AI agents (e.g., underwriting algorithms, chatbots)

#### Resource
Defines what data entity or object is being acted upon. Resources represent the business objects in your system:
- Loan Applications
- Credit Reports
- Payment Records
- Customer Profiles

Resources contain:
- **Attributes**: Key-value properties (loan amount, credit score, employment status)
- **Actions**: Operations that can be performed on the resource (nested within the resource)

#### Action
Defines what operation is being performed on a specific resource. Actions are always contextual to their parent resource:
- **Loan Resource**: `apply`, `approve`, `fund`, `service`
- **Credit Report Resource**: `check`, `pull`, `verify`
- **Payment Resource**: `process`, `refund`, `schedule`

#### Operation
A convenient reference combining Resource + Action using dot notation (e.g., `loan.apply`, `payment.process`). Operations resolve to the specific action within the specified resource's available actions.

### Attributes
**Attributes** are key-value properties that can be attached to resources and other entities. They provide:
- Typed data values (string, number, boolean, etc.)
- Validation rules and constraints
- Metadata for UI and API contexts
- Required/optional and read-only flags

### Programs
**Programs** are strategic initiatives that coordinate multiple related projects to achieve larger organizational goals. They provide higher-level governance and coordination across projects that may span multiple products or business areas.

Programs enable:
- **Strategic Alignment**: Ensuring projects work toward common business objectives
- **Resource Coordination**: Optimizing resource allocation across related projects
- **Dependency Management**: Managing interdependencies between projects
- **Portfolio Tracking**: Monitoring progress toward program-level outcomes
- **Risk Management**: Identifying and mitigating risks at the portfolio level

Example: A "Digital Transformation Program" might coordinate projects for borrower portal enhancement, automated underwriting, and risk assessment modernization across multiple products.

### Projects
**Projects** represent focused initiatives that highlight and modify a specific slice of a product's DNA graph. For example, a "Borrower Onboarding Improvement" project might focus on steps 2 & 3 of the loan application workflow.

Projects can:
- **Add** new steps to existing workflows
- **Update** existing steps with improved processes
- **Remove** unnecessary or outdated steps

Once a project is complete, its changes merge back into the Product's cumulative DNA graph, updating the master workflow definitions.

### Tasks
**Tasks** are the specific work items within projects that break down the project's objectives into manageable, assignable pieces of work. Each task represents a concrete deliverable or milestone that contributes to achieving the project's goals.

Tasks provide detailed project management capabilities including:
- **Assignment and Ownership**: Clear assignee and responsibility tracking
- **Timeline Management**: Start dates, due dates, and completion tracking  
- **Effort Estimation**: Estimated vs. actual hours with time tracking
- **Dependencies**: Task sequencing and prerequisite management
- **Progress Tracking**: Status updates, percentage completion, and notes
- **Quality Assurance**: Acceptance criteria and deliverable specifications
- **Risk Management**: Task-specific risks and mitigation strategies
- **Categorization**: Work type classification (analysis, development, testing, etc.)

Example tasks within a "Borrower Onboarding Improvement" project might include:
- Analyze Current Income Verification Process
- Design Automated Verification System  
- Implement AI Risk Assessment Step
- Create Integration Test Suite
- Deploy to Staging Environment

## Entity Relationships

The two-layer architecture creates clear separation between business process definition and change management:

### Product Layer
This represents business processes (internal products) and user flows (external products)

```
Organization
├── Product A (e.g., Loan Origination System)
│   ├── Workflow 1 (e.g., Loan Application)
│   │   ├── Step 1: Borrower → loan.apply
│   │   ├── Step 2: Loan Officer → income_docs.verify  
│   │   └── Step 3: System → credit_report.check
│   └── Workflow 2 (e.g., Loan Servicing)
└── Product B (e.g., Payments)
    └── Workflow 3 (e.g., Payment Processing)
```

### Project Layer (Change Management)
A simple framework for project management

```
Programs (strategic coordination)
├── Program A: Digital Transformation Initiative
│   ├── Project X: Modify Product A, Workflow 1, Steps 2-3
│   │   ├── Task 1: Analyze Current Process
│   │   ├── Task 2: Design New Automation
│   │   └── Task 3: Implement & Test Changes
│   └── Project Y: Add new steps to Product B, Workflow 3
│       ├── Task 1: Requirements Gathering
│       └── Task 2: Development & Integration
└── Program B: Risk Management Modernization
    └── Project Z: Automated Risk Assessment
        ├── Task 1: Algorithm Development
        └── Task 2: Integration Testing
```

### Layer Interactions
- **Programs** coordinate strategic initiatives across multiple projects and products
- **Projects** reference specific **Products** and **Workflows** they aim to modify
- **Tasks** break down project work into manageable units
- Upon project completion, changes merge back into the Product Layer's permanent structure
- The Product Layer remains stable while the Project Layer enables controlled evolution

## Benefits of the Two-Layer Architecture

This dual-layer structure provides several key advantages:

### Product Layer Benefits
- **Stability**: Business processes remain consistent and reliable
- **Reusability**: Workflows can be referenced and reused across projects
- **Governance**: Clear ownership and compliance tracking for business processes
- **Automation**: Enables both human and automated actors to participate consistently
- **Abstraction**: Models complex business processes at multiple levels

### Project Layer Benefits  
- **Controlled Change**: Structured approach to process improvement
- **Parallel Development**: Multiple projects can target different areas simultaneously
- **Impact Assessment**: Clear visibility into what processes are being modified
- **Rollback Capability**: Changes can be reversed if needed
- **Progress Tracking**: Detailed project and task management capabilities

### Cross-Layer Benefits
- **Separation of Concerns**: Business logic separated from change management
- **Auditability**: Complete history of process evolution through projects
- **Risk Management**: Changes are planned, tracked, and validated before integration
- **Scalability**: Framework grows efficiently with organizational complexity

Each entity is defined by JSON schemas that ensure consistency and enable tooling for validation, code generation, and process automation across both layers.

## Schemas

The following JSON schemas define the structure and validation rules for each DNA entity, organized by architectural layer, and building on the base:

- **`base.json`** - Base schema defining common properties (id, name, key, type, description) inherited by all DNA entities

### Core Layer Schemas
- **`actor.json`** - Actor schema for Users, Roles, Systems, and Agents
- **`action.json`** - Action schema for operations performed by actors
- **`resource.json`** - Resource schema for data entities with attributes and actions
- **`attribute.json`** - Attribute schema for key-value properties with validation and metadata

### Product Layer Schemas (Business Process Definition)
- **`organization.json`** - Organization entity schema with domain classification and product references
- **`product.json`** - Product entity schema with lifecycle status, ownership, and workflow management
- **`workflow.json`** - Workflow entity schema defining business processes with step sequences and triggers
- **`step.json`** - Step entity schema representing atomic Actor→Action→Resource operations

### Project Layer Schemas (Change Management)
- **`program.json`** - Program schema for strategic initiatives coordinating multiple related projects
- **`project.json`** - Project schema for managing the tactical, workflow modifications and improvements
- **`task.json`** - Task schema for specific work items within projects with tracking and management features

### Value Layer Schemas (Business Impact & Measurement)
- **`outcome.json`** - Outcome schema for measurable business results (e.g., increased MRR, reduced churn)
- **`opportunity.json`** - Opportunity schema for business improvement areas (e.g., improved borrower experience, better engagement)
- **`metric.json`** - Metric schema for quantifiable performance indicators (e.g., borrower satisfaction improved by 20%)
- **`solution.json`** - Solution schema for proposed implementations (e.g., borrower dashboard, automated workflows)

### Schema Features
Each schema includes:
- **Type Safety**: Strict typing and validation rules
- **Examples**: Real-world usage examples for each entity type
- **Extensibility**: Support for custom metadata and additional properties
- **Relationships**: Cross-references between related entities
- **Compliance**: Support for regulatory and business requirements
