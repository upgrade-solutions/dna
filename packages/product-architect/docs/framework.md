# Product Architect Framework

## Overview
**Phases:** `Design → Build → Run`  
*(Plan it → Construct it → Operate it)*

**Layers:** `System`, `Structure`, `Schema`, `State`, `Signal`, `Style`

This framework unifies the lifecycle of a product or platform from concept to operation, representing both its blueprint and its living form.

---

## 1. System
> The complete composition — the "project" or "organism."

| Phase | Description |
|--------|--------------|
| **Design** | Define the system boundary, purpose, and context. What’s this system for? What domains and actors does it include? |
| **Build** | Assemble components and integrate dependencies. How is it wired together? What services, APIs, and UIs make it whole? |
| **Run** | Monitor and evolve the system as a living whole. How does it perform, adapt, and interact in the environment? |

*Analogy: The building as a whole ecosystem — foundation, structure, utilities, and occupants working together.*

---

## 2. Structure
> The architecture — components, modules, connections.

| Phase | Description |
|--------|--------------|
| **Design** | Create blueprints and diagrams of how elements fit together. |
| **Build** | Construct the elements, provision resources, deploy infrastructure. |
| **Run** | Track live components, health, and runtime architecture. |

*Analogy: The skeleton and wiring of the system.*

---

## 3. Schema
> The data and configuration layer — definitions and actual content.

| Phase | Description |
|--------|--------------|
| **Design** | Define data models, fields, and validation logic. |
| **Build** | Generate schemas, migrations, and API contracts. |
| **Run** | Observe and manage live data flowing through the system. |

*Analogy: The specs and materials list of your architecture.*

---

## 4. State
> The dynamic behavior — how things change over time.

| Phase | Description |
|--------|--------------|
| **Design** | Define possible states, transitions, and workflows. |
| **Build** | Implement state machines, UI transitions, and automation logic. |
| **Run** | Track actual runtime state and transitions (progress, usage, uptime). |

*Analogy: The process, timing, and flow of activity.*

---

## 5. Signal
> The communication layer — events, triggers, and reactions.

| Phase | Description |
|--------|--------------|
| **Design** | Model event flows, publishers, subscribers, and triggers. |
| **Build** | Implement event buses, listeners, and notification systems. |
| **Run** | Monitor live events, alerts, telemetry, and feedback loops. |

*Analogy: The nervous system of your architecture.*

---

## 6. Style
> The expression and identity — how it looks, feels, or behaves outwardly.

| Phase | Description |
|--------|--------------|
| **Design** | Define visual, interaction, and thematic rules. |
| **Build** | Implement style guides, component libraries, and consistent UX. |
| **Run** | Adapt and personalize live presentation and behavior. |

*Analogy: The character and appearance of your system.*

---

## Flow Summary
Mirrors the lifecycle of architecture and living systems.

| **Phase** | **Focus** | **Description** |
|--------|--------|-------------|
| **Design** | Blueprint and Plan | Define purpose, structure, and specification. |
| **Build** | Construct and Connect | Construct, integrate, and deploy components. |
| **Run** | Operate and Evolve | Monitor, adapt, and evolve live systems. |

---

## Framework Grid

| **Layer ↓ / Phase →** | **Design** | **Build** | **Run** |
|------------------------|-------------|-------------|-----------|
| **System** | Define the system boundary, purpose, and context. | Assemble components and integrate dependencies. | Monitor and evolve the system as a living whole. |
| **Structure** | Create blueprints and diagrams of how elements fit together. | Construct elements, provision resources, deploy infrastructure. | Track live components, health, and runtime architecture. |
| **Schema** | Define data models, fields, and validation logic. | Generate schemas, migrations, and API contracts. | Observe and manage live data flowing through the system. |
| **State** | Define possible states, transitions, and workflows. | Implement state machines, UI transitions, and automation logic. | Track actual runtime state and transitions (progress, usage, uptime). |
| **Signal** | Model event flows, publishers, subscribers, and triggers. | Implement event buses, listeners, and notification systems. | Monitor live events, alerts, telemetry, and feedback loops. |
| **Style** | Define visual, interaction, and thematic rules. | Implement style guides, component libraries, and consistent UX. | Adapt and personalize live presentation and behavior. |

## Prompt for Product Architect Home Page
We're going to create a new section on the page, to be like photoshop layers on a canvas, and if one is turned off, it's functionality is no longer visible. 

The context of the canvas and elements is a UI form with form fields and a submit button. As part of the form, it should have an "agree to terms" checkbox and the submit button should be disabled until it's checked.

Here are the layers:
* Structure - this is the base layer and will always be visible. It should show a container with a form, form fields, and a submit button
* Schema - when this layer is on, it adds in form labels, the submit button text, etc.
* State - when this layer is on, it shows controls for form fields that are disabled or in error state, and the button states as well
* Signal - when this layer is on, it shows how changes to one component can send events that other components can subscribe to (e.g. the submit button subscribing to the agree checkbox event)
* Style - when this layer is on, it adds the right styles and fonts according to a theme.