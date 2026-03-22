# Digital DNA
Digital DNA unifies scattered business knowledge into a single source of truth. Once defined, your DNA can be used to generate documentation, workflows, and robust software automatically. It's your digital blueprint for building business applications.

More specifically, DNA is a language for expressing applications and their architectures. It's simply a DSL written in JSON/YAML with some core primitives and support for adapters. Any configuration written in JSON can be plugged into the DNA engine. 

There are two parts to DNA: Structure and Behavior.

## Structure
The structural elements of applications are critical. They express hierarchy, dependencies, layouts, etc. 
* **Resource** - The nouns of the business
* **Action** - The verbs of the business
* **Attribute** - The properties on a Resource
* **Namespace** - A grouping mechanism for similar Resources

### Resource
A Resource is a core noun of a business domain — a named entity that the system tracks, manages, or operates on. Resources have identity (they can be referenced by ID), persist over time, and are the subject of Actions.

**Examples:**
- Finance: `Loan`, `Invoice`, `Payment`, `Account`
- Healthcare: `Patient`, `Claim`, `Prescription`, `Appointment`
- E-commerce: `Order`, `Product`, `Cart`, `Shipment`
- Publishing: `Post`, `Author`, `Comment`, `Tag`
- HR: `Employee`, `Position`, `Review`, `Department`

### Action
An Action a the core verb of a business domain — something that can be performed on or by a Resource. Actions describe the operations that drive the business forward and produce meaningful state changes.

**Examples:**
- `Loan` → `Apply`, `Approve`, `Disburse`, `Repay`, `Default`
- `Order` → `Place`, `Cancel`, `Fulfill`, `Refund`, `Ship`
- `Employee` → `Hire`, `Promote`, `Terminate`, `Transfer`
- `Claim` → `Submit`, `Review`, `Approve`, `Deny`, `Appeal`

### Attribute
An Attribute is a property that belongs to a Resource. Attributes describe the data shape of a Resource — its fields, their types, and any constraints.

**Examples:**
- `Loan` → `amount` (number), `interest_rate` (number), `status` (enum), `due_date` (date)
- `Post` → `title` (string), `body` (text), `published_at` (datetime), `slug` (string)
- `Employee` → `name` (string), `email` (string), `start_date` (date), `salary` (number)

### Namespace
A Namespace is a grouping mechanism that organizes related Resources into a logical domain boundary. Namespaces can be multiple levels deep — for example, the top level might be the organization, followed by a domain, then a module, with Resources at the leaves. This hierarchy prevents naming collisions and communicates ownership and bounded context at every level.

**Examples:**
- `acme` → `billing` → `invoicing` → `Invoice`, `LineItem`
- `acme` → `billing` → `payments` → `Payment`, `Refund`
- `acme` → `content` → `publishing` → `Post`, `Author`, `Tag`
- `acme` → `identity` → `auth` → `User`, `Session`, `Token`

## Behavior
Applications are made for interactivity, and DNA has primitives for expressing behavior.
