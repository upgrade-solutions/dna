// Resource-Action Registry Manager
// Manages the mapping of resource:action combinations to routes, handlers, and policies
// Provides auto-discovery from OpenAPI specs and runtime resource:action resolution

import { OpenAPISpec, OpenAPIOperation, HandlerConfig, AccessControlPolicy, ResourceActionImpl } from "../types.ts";

/**
 * Represents a resource:action mapping with all its metadata
 */
export interface ResourceActionMapping {
  // Class-level identity
  id: string; // e.g., "user:read"
  resource: string; // e.g., "user"
  action: string; // e.g., "read"

  // Route information
  routes: Array<{
    method: string; // "GET", "POST", etc.
    path: string; // "/users", "/users/{id}", etc.
  }>;

  // Handler and policy information
  handler?: HandlerConfig;
  accessControlPolicy?: AccessControlPolicy;

  // Metadata
  description?: string;
  operationIds?: string[];
}

/**
 * Registry for managing resource:action combinations
 * Auto-discovers from OpenAPI spec's x-resource-action annotations
 */
export class ResourceActionRegistry {
  private mappings: Map<string, ResourceActionMapping> = new Map();
  private routeToResourceAction: Map<string, string> = new Map(); // Maps "GET /users/{id}" to "user:read"
  private spec: OpenAPISpec | undefined;

  /**
   * Build the registry from an OpenAPI spec
   * Scans all operations for x-resource-action annotations
   */
  buildFromSpec(spec: OpenAPISpec): void {
    this.spec = spec;
    this.mappings.clear();
    this.routeToResourceAction.clear();

    const methods = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];

    for (const [path, pathItem] of Object.entries(spec.paths || {})) {
      if (!pathItem || typeof pathItem !== "object") continue;

      for (const method of methods) {
        const operation = (pathItem as Record<string, unknown>)[method] as
          | (OpenAPIOperation & Record<string, unknown>)
          | undefined;

        if (!operation || typeof operation !== "object") continue;

        const resourceActionStr = operation["x-resource-action"] as string | undefined;
        if (!resourceActionStr) {
          console.debug(`No x-resource-action for ${method.toUpperCase()} ${path}`);
          continue;
        }

        // Parse resource:action format
        const [resource, action] = resourceActionStr.split(":");
        if (!resource || !action) {
          console.warn(
            `Invalid x-resource-action format "${resourceActionStr}" at ${method.toUpperCase()} ${path}. Expected "resource:action"`
          );
          continue;
        }

        const id = `${resource}:${action}`;

        // Get or create mapping
        let mapping = this.mappings.get(id);
        if (!mapping) {
          mapping = {
            id,
            resource,
            action,
            routes: [],
            operationIds: [],
            description: operation.description as string | undefined,
            handler: operation["x-handler"] as HandlerConfig | undefined,
            accessControlPolicy: operation[
              "x-access-control"
            ] as AccessControlPolicy | undefined,
          };
          this.mappings.set(id, mapping);
        }

        // Add route
        mapping.routes.push({
          method: method.toUpperCase(),
          path,
        });

        // Track operation ID
        if (operation.operationId) {
          mapping.operationIds!.push(operation.operationId as string);
        }

        // Map route signature to resource:action for fast lookup
        const routeSignature = `${method.toUpperCase()} ${path}`;
        this.routeToResourceAction.set(routeSignature, id);
      }
    }

    console.log(
      `[ResourceActionRegistry] Built registry with ${this.mappings.size} resource:action mappings from OpenAPI spec`
    );
  }

  /**
   * Get a resource:action mapping by resource and action
   */
  getByResourceAction(resource: string, action: string): ResourceActionMapping | undefined {
    return this.mappings.get(`${resource}:${action}`);
  }

  /**
   * Get a resource:action mapping by ID (e.g., "user:read")
   */
  getById(id: string): ResourceActionMapping | undefined {
    return this.mappings.get(id);
  }

  /**
   * Get resource:action ID for a specific route
   */
  getResourceActionForRoute(method: string, path: string): string | undefined {
    return this.routeToResourceAction.get(`${method.toUpperCase()} ${path}`);
  }

  /**
   * Get all mappings
   */
  getAllMappings(): ResourceActionMapping[] {
    return Array.from(this.mappings.values());
  }

  /**
   * Get all mappings for a specific resource
   */
  getMappingsForResource(resource: string): ResourceActionMapping[] {
    return Array.from(this.mappings.values()).filter((m) => m.resource === resource);
  }

  /**
   * Get all available resources
   */
  getAllResources(): string[] {
    const resources = new Set<string>();
    for (const mapping of this.mappings.values()) {
      resources.add(mapping.resource);
    }
    return Array.from(resources).sort();
  }

  /**
   * Create a ResourceActionImpl instance with optional instance-level context
   */
  createResourceAction(
    resource: string,
    action: string,
    targetId?: string,
    targetScope?: string
  ): ResourceActionImpl {
    return new ResourceActionImpl(resource, action, targetId, targetScope);
  }

  /**
   * Validate that a resource:action combination exists in the registry
   */
  exists(resource: string, action: string): boolean {
    return this.mappings.has(`${resource}:${action}`);
  }

  /**
   * Get all actions available for a resource
   */
  getActionsForResource(resource: string): string[] {
    return Array.from(this.mappings.values())
      .filter((m) => m.resource === resource)
      .map((m) => m.action)
      .sort();
  }

  /**
   * Get the current OpenAPI spec
   */
  getSpec(): OpenAPISpec | undefined {
    return this.spec;
  }

  /**
   * Update the spec and rebuild registry (for hot reloading)
   */
  updateSpec(spec: OpenAPISpec): void {
    this.buildFromSpec(spec);
  }

  /**
   * Clear the registry
   */
  clear(): void {
    this.mappings.clear();
    this.routeToResourceAction.clear();
    this.spec = undefined;
  }

  /**
   * Get debug information about the registry
   */
  getDebugInfo(): {
    totalMappings: number;
    resources: string[];
    mappings: Record<string, ResourceActionMapping>;
  } {
    const mappingsObj: Record<string, ResourceActionMapping> = {};
    for (const [id, mapping] of this.mappings.entries()) {
      mappingsObj[id] = mapping;
    }

    return {
      totalMappings: this.mappings.size,
      resources: this.getAllResources(),
      mappings: mappingsObj,
    };
  }
}

/**
 * Factory function to create and initialize a ResourceActionRegistry
 */
export function createResourceActionRegistry(spec?: OpenAPISpec): ResourceActionRegistry {
  const registry = new ResourceActionRegistry();
  if (spec) {
    registry.buildFromSpec(spec);
  }
  return registry;
}
