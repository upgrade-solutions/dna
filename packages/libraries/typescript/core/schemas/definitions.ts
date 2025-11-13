/**
 * Core DNA Schemas - Pre-loaded and available at runtime
 * These schemas are bundled with the library for convenient access
 *
 * Usage:
 *   import { schemas } from "@dna/core/schemas/json";
 *   const actionSchema = schemas.action;
 */

// Core schemas
import action from "./definitions/foundational/action.json" with { type: "json" };
import actor from "./definitions/foundational/actor.json" with { type: "json" };
import attribute from "./definitions/foundational/attribute.json" with { type: "json" };
import operation from "./definitions/foundational/operation.json" with { type: "json" };
import resource from "./definitions/foundational/resource.json" with { type: "json" };
import task from "./definitions/foundational/task.json" with { type: "json" };

// Platform schemas
import platform from "./definitions/technical/platform.json" with { type: "json" };
import application from "./definitions/technical/application.json" with { type: "json" };
import api from "./definitions/technical/application/api/api.json" with { type: "json" };
import authContext from "./definitions/technical/application/api/auth-context.json" with { type: "json" };
import endpoint from "./definitions/technical/application/api/endpoint.json" with { type: "json" };
import payload from "./definitions/technical/application/api/payload.json" with { type: "json" };
import ui from "./definitions/technical/application/ui/ui.json" with { type: "json" };
import component from "./definitions/technical/application/ui/component.json" with { type: "json" };
import flow from "./definitions/technical/application/ui/flow.json" with { type: "json" };
import layout from "./definitions/technical/application/ui/layout.json" with { type: "json" };
import page from "./definitions/technical/application/ui/page.json" with { type: "json" };

// Value schemas
import metric from "./definitions/strategic/metric.json" with { type: "json" };
import opportunity from "./definitions/strategic/opportunity.json" with { type: "json" };
import outcome from "./definitions/strategic/outcome.json" with { type: "json" };

export const schemas = {
  // Core
  action,
  actor,
  attribute,
  operation,
  resource,
  task,
  // Platform
  platform,
  application,
  // API
  api,
  authContext,
  endpoint,
  payload,
  // UI
  ui,
  component,
  flow,
  layout,
  page,
  // Value
  metric,
  opportunity,
  outcome,
} as const;

export type SchemaName = keyof typeof schemas;
