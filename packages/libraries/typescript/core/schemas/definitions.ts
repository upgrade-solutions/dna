/**
 * Core DNA Schemas - Pre-loaded and available at runtime
 * These schemas are bundled with the library for convenient access
 *
 * Usage:
 *   import { schemas } from "@dna/core/schemas/json";
 *   const actionSchema = schemas.action;
 */

// Core schemas
import action from "./definitions/core/action.json" with { type: "json" };
import actor from "./definitions/core/actor.json" with { type: "json" };
import attribute from "./definitions/core/attribute.json" with { type: "json" };
import operation from "./definitions/core/operation.json" with { type: "json" };
import resource from "./definitions/core/resource.json" with { type: "json" };
import task from "./definitions/core/task.json" with { type: "json" };

// Platform schemas
import platform from "./definitions/platform-management/platform.json" with { type: "json" };
import application from "./definitions/platform-management/application.json" with { type: "json" };
import api from "./definitions/platform-management/application/api/api.json" with { type: "json" };
import authContext from "./definitions/platform-management/application/api/auth-context.json" with { type: "json" };
import endpoint from "./definitions/platform-management/application/api/endpoint.json" with { type: "json" };
import payload from "./definitions/platform-management/application/api/payload.json" with { type: "json" };
import ui from "./definitions/platform-management/application/ui/ui.json" with { type: "json" };
import component from "./definitions/platform-management/application/ui/component.json" with { type: "json" };
import flow from "./definitions/platform-management/application/ui/flow.json" with { type: "json" };
import layout from "./definitions/platform-management/application/ui/layout.json" with { type: "json" };
import page from "./definitions/platform-management/application/ui/page.json" with { type: "json" };

// Value schemas
import metric from "./definitions/value/metric.json" with { type: "json" };
import opportunity from "./definitions/value/opportunity.json" with { type: "json" };
import outcome from "./definitions/value/outcome.json" with { type: "json" };

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
