# DNA Schema Definitions

Auto-generated documentation for all DNA schema definitions.

## Core

- [State Transition](./core/state-transition.md) - A record of a single state transition in an entity's lifecycle.
- [Action](./core/action.md) - An operation performed by an actor on a resource.
- [Attribute](./core/attribute.md) - A key-value property that can be attached to resources, API endpoints, UI components, and other entities.
- [Task](./core/task.md) - A runtime instance representing a specific unit of work being performed by an actor on a resource, with state tracking and lifecycle management.
- [Actor](./core/actor.md) - A user, role, system, or agent performing actions within the DNA model.
- [Resource](./core/resource.md) - A data entity or object acted upon within the DNA model.
- [Operation](./core/operation.md) - A reusable specification for how work gets done, combining a resource, an action, capabilities, and lifecycle states.

## Platform

- [Platform](./platform/platform.md) - A container for applications with UI and API layers.
- [Application](./platform/application.md) - A containerized system with UI and API layers within a platform.

## Value

- [Outcome](./value/outcome.md) - A measurable business result achieved through programs, projects, or workflows.
- [Opportunity](./value/opportunity.md) - A business improvement area that can drive measurable outcomes.
- [Metric](./value/metric.md) - A quantifiable performance indicator that measures progress toward outcomes.
- [Solution](./value/solution.md) - A proposed implementation to address opportunities and drive outcomes.

## Product

- [Workflow](./product/workflow.md) - A sequence of actions performed by actors on resources.
- [Step](./product/step.md) - An atomic building block representing Actor > Operation, supporting explicit and dot notation syntax.
- [Organization](./product/organization.md) - The top-level entity that owns multiple products and encompasses all business operations.
- [Product](./product/product.md) - A long-lived structure representing a major business offering or system within an organization.

## Project

- [Project](./project/project.md) - A focused initiative that highlights and modifies a specific slice of a product's DNA graph.
- [Program](./project/program.md) - A strategic initiative that coordinates multiple related projects to achieve larger organizational goals.
- [Task](./project/task.md) - A specific work item within a project that contributes to achieving the project's objectives.

