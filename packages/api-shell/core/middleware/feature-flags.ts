// Feature Flags Middleware
// Enforces x-feature-flags in route handlers
/// <reference lib="deno.window" />

import {
  FeatureFlagEvaluator,
  createFeatureFlagEvaluator,
} from "../managers/feature-flags-manager.ts";
import {
  FeatureFlag,
  FeatureFlagContext,
  ExecutionContext,
  FeatureFlagResult,
} from "../types.ts";

/**
 * Feature Flags Middleware Factory
 * Creates middleware that enforces x-feature-flags
 */
export class FeatureFlagMiddleware {
  private evaluator: FeatureFlagEvaluator;

  constructor(evaluator?: FeatureFlagEvaluator) {
    this.evaluator = evaluator || createFeatureFlagEvaluator();
  }

  /**
   * Middleware function to check feature flags
   * Returns a middleware function compatible with Oak or similar frameworks
   *
   * Usage:
   *   const middleware = featureFlags.middleware(flags, contextBuilder);
   *   app.use(middleware);
   */
  middleware(
    flags: FeatureFlag[] | undefined,
    contextBuilder: (ctx: ExecutionContext) => FeatureFlagContext | null
  ) {
    return async (ctx: unknown, next: unknown) => {
      // If no flags defined, allow access
      if (!flags || flags.length === 0) {
        if (typeof next === "function") {
          // deno-lint-ignore no-explicit-any
          await (next as any)();
        }
        return;
      }

      // Build feature flag context from execution context
      const execCtx = ctx as ExecutionContext;
      const ffContext = contextBuilder(execCtx);

      if (!ffContext) {
        // No context available, deny access
        // deno-lint-ignore no-explicit-any
        (ctx as any).response.status = 401;
        // deno-lint-ignore no-explicit-any
        (ctx as any).response.body = {
          error: "Unauthorized",
          message: "Could not determine feature flag context",
        };
        return;
      }

      // Evaluate all flags (all must pass)
      const result = this.evaluator.evaluateAll(flags, ffContext);

      if (!result.enabled) {
        // deno-lint-ignore no-explicit-any
        (ctx as any).response.status = 403;
        // deno-lint-ignore no-explicit-any
        (ctx as any).response.body = {
          error: "Forbidden",
          message: `Feature not available: ${result.reason}`,
        };
        return;
      }

      // Feature enabled, continue to next middleware/handler
      if (typeof next === "function") {
        // deno-lint-ignore no-explicit-any
        await (next as any)();
      }
    };
  }

  /**
   * Check if feature is enabled for a given context
   * Returns FeatureFlagResult with detailed information
   */
  checkFeature(
    flags: FeatureFlag[] | undefined,
    context: FeatureFlagContext
  ): FeatureFlagResult {
    if (!flags || flags.length === 0) {
      return {
        enabled: true,
        reason: "No flags defined",
      };
    }

    return this.evaluator.evaluateAll(flags, context);
  }

  /**
   * Check if any feature is enabled (OR logic)
   * At least one flag must pass
   */
  checkAnyFeature(
    flags: FeatureFlag[] | undefined,
    context: FeatureFlagContext
  ): FeatureFlagResult {
    if (!flags || flags.length === 0) {
      return {
        enabled: true,
        reason: "No flags defined",
      };
    }

    return this.evaluator.evaluateAny(flags, context);
  }

  /**
   * Check if feature is enabled and throw error if not
   * Useful for imperative checks within handlers
   */
  checkFeatureOrThrow(
    flags: FeatureFlag[] | undefined,
    context: FeatureFlagContext,
    errorMessage?: string
  ): FeatureFlagResult {
    const result = this.checkFeature(flags, context);

    if (!result.enabled) {
      throw new Error(
        errorMessage || `Feature not available: ${result.reason}`
      );
    }

    return result;
  }

  /**
   * Get the evaluator instance
   * Useful for advanced use cases or custom evaluations
   */
  getEvaluator(): FeatureFlagEvaluator {
    return this.evaluator;
  }

  /**
   * Set a new evaluator (e.g., with updated OpenAPI spec)
   */
  setEvaluator(evaluator: FeatureFlagEvaluator): void {
    this.evaluator = evaluator;
  }
}

/**
 * Helper function to create feature flags middleware
 */
export function createFeatureFlagMiddleware(
  evaluator?: FeatureFlagEvaluator
): FeatureFlagMiddleware {
  return new FeatureFlagMiddleware(evaluator);
}

/**
 * Standard context builder for Oak framework
 * Extracts subject from request headers/auth, environment from config
 */
export function createOakContextBuilder(
  getEnvironmentName: () => string
): (ctx: ExecutionContext) => FeatureFlagContext | null {
  return (ctx: ExecutionContext) => {
    // Extract subject from user (assumes auth middleware populated user)
    // deno-lint-ignore no-explicit-any
    const user = (ctx as any).user;
    if (!user || !user.id || !user.role) {
      return null;
    }

    return {
      subject: {
        id: user.id,
        role: user.role,
      },
      environment: {
        name: getEnvironmentName(),
      },
    };
  };
}

/**
 * Example usage:
 *
 * const middleware = createFeatureFlagMiddleware();
 *
 * const contextBuilder = createOakContextBuilder(() => Deno.env.get("ENVIRONMENT") || "development");
 *
 * const flags = [
 *   { $ref: '#/components/x-flags/beta-ui' }
 * ];
 *
 * app.use(middleware.middleware(flags, contextBuilder));
 *
 * Or for imperative checking:
 *
 * // Inside a route handler
 * const context = contextBuilder(ctx);
 * const result = middleware.checkFeature(flags, context);
 * if (!result.enabled) {
 *   ctx.response.status = 403;
 *   ctx.response.body = { error: result.reason };
 *   return;
 * }
 */
