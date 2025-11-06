# DNA Schemas

Auto-generated documentation for all DNA schemas.

## Core

- [Action Schema](./core/action.md) - Defines an action — an operation performed by an actor on a resource.
- [Actor Schema](./core/actor.md) - Defines an actor — a user, role, system, or agent performing actions within the DNA model.
- [Attribute Schema](./core/attribute.md) - Defines an attribute — a key-value property that can be attached to resources, API endpoints, UI components, and other entities.
- [Operation Schema](./core/operation.md) - Defines an operation — a reusable specification for how work gets done, combining a resource, an action, capabilities (allowed actors), and lifecycle states. Operations are the blueprint for task instances.
- [Resource Schema](./core/resource.md) - Defines a resource — a data entity or object acted upon within the DNA model.
- [Task Schema](./core/task.md) - Defines a task — a runtime instance of a task template, representing a specific unit of work being performed by an actor on a resource, with state tracking and lifecycle management.

## Platform

- [Application Schema](./platform/application.md) - Defines an application — a containerized system with UI and API layers within a platform.
- [Platform Schema](./platform/platform.md) - Defines a platform — the container for applications with UI and API layers.

## Product

- [Organization Schema](./product/organization.md) - Defines an organization — the top-level entity that owns multiple products and encompasses all business operations.
- [Product Schema](./product/product.md) - Defines a product — a long-lived structure representing a major business offering or system within an organization.
- [Step Schema](./product/step.md) - Defines a step — an atomic building block representing Actor > Operation. Supports dual syntax: explicit (actor + resource + action) or dot notation (actor + operation).
- [Workflow Schema](./product/workflow.md) - Defines a workflow — a sequence of actions performed by actors on resources.

## Project

- [Program Schema](./project/program.md) - Defines a program — a strategic initiative that coordinates multiple related projects to achieve larger organizational goals.
- [Project Schema](./project/project.md) - Defines a project — a focused initiative that highlights and modifies a specific slice of a product's DNA graph.
- [Task Schema](./project/task.md) - Defines a task — a specific work item within a project that contributes to achieving the project's objectives.

## Value

- [Metric Schema](./value/metric.md) - Defines a metric — a quantifiable performance indicator that measures progress toward outcomes.
- [Opportunity Schema](./value/opportunity.md) - Defines an opportunity — a business improvement area that can drive measurable outcomes.
- [Outcome Schema](./value/outcome.md) - Defines an outcome — a measurable business result achieved through programs, projects, or workflows.
- [Solution Schema](./value/solution.md) - Defines a solution — a proposed implementation to address opportunities and drive outcomes.

