# Digital DNA
Digital DNA unifies scattered business knowledge into a single source of truth. Once defined, your DNA can be used to generate documentation, workflows, and robust software automatically. It's your digital blueprint for building business applications. 

More specifically, DNA is a language for expressing applications and their architectures. It can describe UI layouts and user journeys, API definitions, database schemas and mappings, infrastructure, and much more. 

DNA is a DSL written in JSON/YAML with some core primitives and support for adapters. Any configuration written in JSON can be plugged into the DNA engine. Examples include: JSON Schema, JSON Logic, OpenAPI Specification, SAM Templates, MCP configuration. 

Here's a simple example in a lending context:

```json
{
  "namespace": "acme.finance.lending",
  "resource": "Loan",
  "attributes": [
    { "name": "amount", "type": "number", "required": true },
    { "name": "interest_rate", "type": "number", "required": true },
    { "name": "status", "type": "enum", "values": ["pending", "active", "repaid", "defaulted"] },
    { "name": "due_date", "type": "date" }
  ],
  "actions": [
    { "name": "Apply" },
    {
      "name": "Approve",
      "rules": [
        { "attribute": "status", "operator": "eq", "value": "pending" }
      ],
      "effects": [
        { "attribute": "status", "set": "active" }
      ]
    },
    { "name": "Disburse" },
    { "name": "Repay" }
  ]
}
```

There are two parts to DNA: Structure and Behavior.

## Structure
The structural elements of applications are critical. They express hierarchy, dependencies, layouts, etc. 
* **Resource** - The nouns of the business
* **Action** - The verbs of the business
* **Operation** - A Resource:Action pair — the unit of business activity
* **Attribute** - The properties on a Resource
* **Namespace** - A grouping mechanism for similar Resources

### Resource — [schema](schemas/resource.json)
A Resource is a core noun of a business domain — a named entity that the system tracks, manages, or operates on. Resources have identity (they can be referenced by ID), persist over time, and are the subject of Actions.

**Examples:**
- Finance: `Loan`, `Invoice`, `Payment`, `Account`
- Healthcare: `Patient`, `Claim`, `Prescription`, `Appointment`
- E-commerce: `Order`, `Product`, `Cart`, `Shipment`
- Publishing: `Post`, `Author`, `Comment`, `Tag`
- HR: `Employee`, `Position`, `Review`, `Department`

### Action — [schema](schemas/action.json)
An Action is the core verb of a business domain — something that can be performed on or by a Resource. Actions describe the things that drive the business forward and produce meaningful state changes.

**Examples:**
- `Loan` → `Apply`, `Approve`, `Disburse`, `Repay`, `Default`
- `Order` → `Place`, `Cancel`, `Fulfill`, `Refund`, `Ship`
- `Employee` → `Hire`, `Promote`, `Terminate`, `Transfer`
- `Claim` → `Submit`, `Review`, `Approve`, `Deny`, `Appeal`

### Operation
An Operation is a Resource:Action pair — the atomic unit of business activity. Where a Resource is a noun and an Action is a verb, an Operation is the complete statement: `Loan.Approve`, `Order.Ship`, `Employee.Terminate`. Behavior primitives (Triggers, Policies, Rules, Effects, Flows) are all defined in terms of Operations.

**Examples:**
- `Loan.Apply`, `Loan.Approve`, `Loan.Disburse`, `Loan.Repay`
- `Order.Place`, `Order.Fulfill`, `Order.Ship`, `Order.Cancel`
- `Employee.Hire`, `Employee.Promote`, `Employee.Terminate`

### Attribute — [schema](schemas/attribute.json)
An Attribute is a property that belongs to a Resource. Attributes describe the data shape of a Resource — its fields, their types, and any constraints.

**Examples:**
- `Loan` → `amount` (number), `interest_rate` (number), `status` (enum), `due_date` (date)
- `Post` → `title` (string), `body` (text), `published_at` (datetime), `slug` (string)
- `Employee` → `name` (string), `email` (string), `start_date` (date), `salary` (number)

### Namespace — [schema](schemas/namespace.json)
A Namespace is a grouping mechanism that organizes related Resources into a logical domain boundary. Namespaces can be multiple levels deep — for example, the top level might be the organization, followed by a domain, then a module, with Resources at the leaves. This hierarchy prevents naming collisions and communicates ownership and bounded context at every level.

**Examples:**
- `acme` → `billing` → `invoicing` → `Invoice`, `LineItem`
- `acme` → `billing` → `payments` → `Payment`, `Refund`
- `acme` → `content` → `publishing` → `Post`, `Author`, `Tag`
- `acme` → `identity` → `auth` → `User`, `Session`, `Token`

## Behavior
Applications are made for interactivity, and DNA has primitives for expressing behavior.
* **Trigger** - What initiates an operation
* **Policy** - Who is allowed to perform an operation
* **Rule** - When an operation is allowed
* **Effect** - What changes after an operation executes
* **Flow** - How operations sequence across a lifecycle

These primitives are ordered: when something initiates an operation (Trigger), the system first checks who is allowed to perform it (Policy), then whether current conditions permit it (Rule). If both pass, the operation executes and its consequences are applied (Effect). Across time, the permitted sequence of operations forms the lifecycle of a Resource (Flow).

```
Trigger → Policy → Rule → [Operation executes] → Effect
                                                     ↓
                                                  Flow
```

### Trigger — [schema](schemas/trigger.json)
A Trigger is an event that initiates an operation — either from a user, an external system, or the passage of time. Triggers are the entry point to all behavior.

**Examples:**
- User submits a form → `Loan.Apply`
- Webhook received from payment processor → `Payment.Confirm`
- Scheduled job at midnight → `Loan.Default` (if overdue)
- Another action completing → `Order.Ship` after `Order.Fulfill`

### Policy — [schema](schemas/policy.json)
A Policy defines who is permitted to perform an operation. Policies are checked before Rules — there's no point evaluating business conditions if the actor isn't authorized.

**Examples:**
- Only `role: underwriter` can execute `Loan.Approve`
- Only the owning `User` can execute `Post.Delete`
- Only `role: admin` can execute `Employee.Terminate`

### Rule — [schema](schemas/rule.json)
A Rule defines the conditions under which an operation is valid — the business logic that must be satisfied before an operation can proceed. Rules are checked after Policy and before execution.

**Examples:**
- `Loan.Approve` requires `status == "pending"` and `amount > 0`
- `Order.Ship` requires `payment_status == "captured"` and `inventory_reserved == true`
- `Employee.Promote` requires `tenure_years >= 1`

### Effect — [schema](schemas/effect.json)
An Effect describes what changes when an operation successfully executes — state transitions, derived updates, and side effects like notifications or downstream operations.

**Examples:**
- `Loan.Approve` sets `status = "active"`, sends an approval email
- `Order.Cancel` sets `status = "cancelled"`, triggers `Payment.Refund`
- `Employee.Terminate` sets `status = "inactive"`, revokes system access

### Flow — [schema](schemas/flow.json)
A Flow describes the valid sequence of operations across the lifecycle of a Resource — which states it can move through and in what order. Flows emerge from the combined shape of all Rules and Effects, but can also be declared explicitly to document intended lifecycle.

**Examples:**
- `Loan`: `Apply → Approve → Disburse → Repay` (or `→ Default`)
- `Order`: `Place → Fulfill → Ship → Deliver` (or `→ Cancel`)
- `Claim`: `Submit → Review → Approve` (or `→ Deny → Appeal`)
