// Access Control Middleware
// Enforces x-access-control policies in route handlers
/// <reference lib="deno.window" />

import {
  AccessControlEvaluator,
  createAccessControlEvaluator,
} from "../managers/access-control-manager.ts";
import {
  AccessControlPolicy,
  AccessControlContext,
  ExecutionContext,
  AccessControlResult,
} from "../types.ts";

/**
 * Access Control Middleware Factory
 * Creates middleware that enforces x-access-control policies
 */
export class AccessControlMiddleware {
  private evaluator: AccessControlEvaluator;

  constructor(evaluator?: AccessControlEvaluator) {
    this.evaluator =
      evaluator || createAccessControlEvaluator();
  }

  /**
   * Middleware function to check access control
   * Returns a middleware function compatible with Oak or similar frameworks
   *
   * Usage:
   *   const middleware = accessControl.middleware(policy, contextBuilder);
   *   app.use(middleware);
   */
  middleware(
    policy: AccessControlPolicy | undefined,
    contextBuilder: (ctx: ExecutionContext) => AccessControlContext | null
  ) {
    return async (ctx: unknown, next: unknown) => {
      // If no policy defined, allow access
      if (!policy) {
        if (typeof next === "function") {
          // deno-lint-ignore no-explicit-any
          await (next as any)();
        }
        return;
      }

      // Build access control context from execution context
      const execCtx = ctx as ExecutionContext;
      const acContext = contextBuilder(execCtx);

      if (!acContext) {
        // No context available, deny access
        // deno-lint-ignore no-explicit-any
        (ctx as any).response.status = 401;
        // deno-lint-ignore no-explicit-any
        (ctx as any).response.body = {
          error: "Unauthorized",
          message: "Could not determine access context",
        };
        return;
      }

      // Evaluate policy
      const result = this.evaluator.evaluate(policy, acContext);

      if (!result.allowed) {
        // deno-lint-ignore no-explicit-any
        (ctx as any).response.status = 403;
        // deno-lint-ignore no-explicit-any
        (ctx as any).response.body = {
          error: "Forbidden",
          message: `Access denied: ${result.reason}`,
        };
        return;
      }

      // Access granted, continue to next middleware/handler
      if (typeof next === "function") {
        // deno-lint-ignore no-explicit-any
        await (next as any)();
      }
    };
  }

  /**
   * Check access for a given policy and context
   * Returns AccessControlResult with detailed information
   */
  checkAccess(
    policy: AccessControlPolicy | undefined,
    context: AccessControlContext
  ): AccessControlResult {
    if (!policy) {
      return {
        allowed: true,
        reason: "No policy defined",
      };
    }

    return this.evaluator.evaluate(policy, context);
  }

  /**
   * Check access and throw error if denied
   * Useful for imperative checks within handlers
   */
  checkAccessOrThrow(
    policy: AccessControlPolicy | undefined,
    context: AccessControlContext,
    errorMessage?: string
  ): AccessControlResult {
    const result = this.checkAccess(policy, context);

    if (!result.allowed) {
      throw new Error(
        errorMessage || `Access denied: ${result.reason}`
      );
    }

    return result;
  }

  /**
   * Get the evaluator instance
   * Useful for advanced use cases or custom evaluations
   */
  getEvaluator(): AccessControlEvaluator {
    return this.evaluator;
  }

  /**
   * Set a new evaluator (e.g., with updated OpenAPI spec)
   */
  setEvaluator(evaluator: AccessControlEvaluator): void {
    this.evaluator = evaluator;
  }
}

/**
 * Helper function to create access control middleware
 */
export function createAccessControlMiddleware(
  evaluator?: AccessControlEvaluator
): AccessControlMiddleware {
  return new AccessControlMiddleware(evaluator);
}

/**
 * Standard context builder for Oak framework
 * Extracts subject from request headers/auth, resource from params
 */
export function createOakContextBuilder(
  resourceIdParam?: string
): (ctx: ExecutionContext) => AccessControlContext | null {
  return (ctx: ExecutionContext) => {
    // Extract subject from user (assumes auth middleware populated user)
    // deno-lint-ignore no-explicit-any
    const user = (ctx as any).user;
    if (!user || !user.id || !user.role) {
      return null;
    }

    // Extract resource ID from params
    // deno-lint-ignore no-explicit-any
    const resourceId = resourceIdParam ? (ctx as any).params[resourceIdParam] : undefined;

    return {
      subject: {
        id: user.id,
        role: user.role,
        department: user.department,
        permissions: user.permissions,
      },
      resource: {
        id: resourceId,
        ownerId: user.ownerId,
      },
      environment: {
        ip: ctx.request.headers.get("x-forwarded-for") ||
          ctx.request.headers.get("remote-addr") ||
          undefined,
        timestamp: Date.now(),
      },
    };
  };
}

/**
 * Example usage:
 *
 * const middleware = createAccessControlMiddleware();
 *
 * const contextBuilder = createOakContextBuilder("userId");
 *
 * const policy = {
 *   roles: ["admin"],
 *   rules: ["subject.id == resource.id"]
 * };
 *
 * app.use(middleware.middleware(policy, contextBuilder));
 *
 * Or for imperative checking:
 *
 * // Inside a route handler
 * const context = contextBuilder(ctx);
 * const result = middleware.checkAccess(policy, context);
 * if (!result.allowed) {
 *   ctx.response.status = 403;
 *   ctx.response.body = { error: result.reason };
 *   return;
 * }
 */
