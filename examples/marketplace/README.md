# Marketplace — example DNA

Two-sided rental marketplace (Airbnb-style). Stress-tests the model against the case where the same User holds peer Roles in multiple Group-Resources at the same time.

## What this example demonstrates

- **One User, two Roles, two Groups, simultaneously**: `Joe` is a `Host` in a `Listing` AND a `Guest` in a `Booking`. Same person, two distinct memberships, two different scoping Groups. The 3-way `User × Role × Group` model handles this without any "primary role" or "active context" notion.
- **Per-Listing / per-Booking Role constraints (modeling-layer declarations)**: `Host` and `Guest` declare `cardinality: "one", required: true` (each Listing has exactly one Host; each Booking has exactly one Guest). Encodes the owner/booker singularity that would otherwise live in prose only.
- **Two Resources serving as Groups**: both `Listing` and `Booking` are tracked structures AND scoping units. Demonstrates that the Group "kind" isn't tied to one specific kind of Resource.
- **Step-level `else` routing**: `BookingFlow.approve` either falls through to `decline` (a sibling step) or aborts — exercises the conditional-branching path.
- **Process triggered by an Operation**: `BookingFlow` fires when `Booking.Request` completes, demonstrating Operation → Process chaining via `source: operation`.
- **Ownership rules**: most access rules carry `ownership: true`, expressing "you can only act on Listings/Bookings *you* own/are on" — same Role, instance-scoped enforcement.
- **Global (unscoped) Role**: `SupportAgent` has no `scope` declared — they can act across any Listing or Booking.

## What this example deliberately omits

- Schedule-source Triggers (see `lending` for a nightly batch pattern).
- Sub-process orchestration (a richer example would split host-approval into a sub-flow).
