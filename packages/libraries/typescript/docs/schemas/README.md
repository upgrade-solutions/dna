# DNA Schema Definitions

Auto-generated documentation for all DNA schema definitions.

## Core

- [Action](./core/action.md) - An operation performed by an actor on a resource.
- [Actor](./core/actor.md) - A user, role, system, or agent performing actions within the DNA model.
- [Attribute](./core/attribute.md) - A key-value property that can be attached to resources, API endpoints, UI components, and other entities.
- [Operation](./core/operation.md) - A reusable specification for how work gets done, combining a resource, an action, and capabilities. State transitions are tracked at runtime through Task instances.
- [Resource](./core/resource.md) - A data entity or object acted upon within the DNA model.
- [State Transition](./core/state-transition.md) - A record of a single state transition in an entity's lifecycle.
- [Task](./core/task.md) - A runtime instance representing a specific unit of work being performed by an actor on a resource. Tracks actual state transitions through an audit trail, providing the source of truth for task lifecycle.

## Platform

- [Application](./platform/application.md) - A containerized system with UI and API layers within a platform.
- [Platform](./platform/platform.md) - A container for applications with UI and API layers.

## Value

- [Metric](./value/metric.md) - A quantifiable performance indicator that measures progress toward outcomes.
- [Opportunity](./value/opportunity.md) - A business improvement area that can drive measurable outcomes.
- [Outcome](./value/outcome.md) - A measurable business result achieved through programs, projects, or workflows.
- [Solution](./value/solution.md) - A proposed implementation to address opportunities and drive outcomes.

## Product

- [Organization](./product/organization.md) - The top-level entity that owns multiple products and encompasses all business operations.
- [Product](./product/product.md) - A long-lived structure representing a major business offering or system within an organization.
- [Step](./product/step.md) - An atomic building block representing Actor > Operation, supporting explicit and dot notation syntax.
- [Workflow](./product/workflow.md) - A sequence of actions performed by actors on resources.

## Project

- [Program](./project/program.md) - A strategic initiative that coordinates multiple related projects to achieve larger organizational goals.
- [Project](./project/project.md) - A focused initiative that highlights and modifies a specific slice of a product's DNA graph.
- [WorkItem](./project/work-item.md) - A specific work item within a project that contributes to achieving the project's objectives.

