// Feature Flags Manager
// Evaluates x-feature-flags policies at runtime
/// <reference lib="deno.window" />

import {
  FeatureFlag,
  FeatureFlagContext,
  FeatureFlagResult,
  OpenAPISpec,
} from "../types.ts";

/**
 * Evaluates feature flags using a hash-based rollout algorithm
 * for consistent, deterministic percentage-based rollouts
 */
class RolloutHasher {
  /**
   * Calculate a deterministic percentage (0-99) for a user ID
   * Same user always gets the same value
   */
  static calculateUserPercentage(userId: string): number {
    // Simple hash function using string character codes
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  /**
   * Check if user qualifies for a rollout percentage
   * Percentage is 0-100, where 100 means all users
   */
  static isUserInRollout(userId: string, percentage: number): boolean {
    if (percentage >= 100) return true;
    if (percentage <= 0) return false;
    return this.calculateUserPercentage(userId) < percentage;
  }
}

/**
 * Evaluates feature flags against a context
 */
export interface FeatureFlagEvaluator {
  evaluate(flag: FeatureFlag, context: FeatureFlagContext): FeatureFlagResult;
  evaluateAll(
    flags: FeatureFlag[],
    context: FeatureFlagContext
  ): FeatureFlagResult;
  evaluateAny(
    flags: FeatureFlag[],
    context: FeatureFlagContext
  ): FeatureFlagResult;
  resolveFlag(flagOrRef: FeatureFlag | string): FeatureFlag;
  getFlags(): Record<string, FeatureFlag>;
  clearCache(): void;
  setOpenAPISpec(spec: OpenAPISpec): void;
  getEvaluationDetails(
    flag: FeatureFlag,
    context: FeatureFlagContext
  ): string;
}

/**
 * Feature Flag Manager implementation
 */
export class FeatureFlagManager implements FeatureFlagEvaluator {
  private flags: Record<string, FeatureFlag> = {};
  private cache: Map<string, FeatureFlag> = new Map();
  private spec?: OpenAPISpec;

  constructor(spec?: OpenAPISpec) {
    if (spec) {
      this.setOpenAPISpec(spec);
    }
  }

  /**
   * Set the OpenAPI spec and extract flags from components.x-flags
   */
  setOpenAPISpec(spec: OpenAPISpec): void {
    this.spec = spec;
    this.clearCache();

    // Extract flags from components.x-flags
    if (spec.components?.["x-flags"]) {
      this.flags = spec.components["x-flags"] as Record<string, FeatureFlag>;
    }
  }

  /**
   * Resolve a flag reference or return the flag as-is
   * Supports $ref like '#/components/x-flags/flag-name'
   */
  resolveFlag(flagOrRef: FeatureFlag | string): FeatureFlag {
    // If string, treat as $ref
    if (typeof flagOrRef === "string") {
      const cached = this.cache.get(flagOrRef);
      if (cached) {
        return cached;
      }

      // Parse the reference
      const match = flagOrRef.match(/#\/components\/x-flags\/(.+)$/);
      if (!match) {
        throw new Error(`Invalid flag reference: ${flagOrRef}`);
      }

      const flagName = match[1];
      const flag = this.flags[flagName];
      if (!flag) {
        throw new Error(`Flag not found: ${flagName}`);
      }

      this.cache.set(flagOrRef, flag);
      return flag;
    }

    // If object with $ref, resolve it
    if (flagOrRef.$ref) {
      return this.resolveFlag(flagOrRef.$ref);
    }

    return flagOrRef;
  }

  /**
   * Evaluate a single flag against context
   */
  evaluate(flag: FeatureFlag, context: FeatureFlagContext): FeatureFlagResult {
    const resolvedFlag = this.resolveFlag(flag);

    // 1. Check global enable
    if (!resolvedFlag.enabled) {
      return {
        enabled: false,
        reason: "Feature is disabled",
      };
    }

    // 2. Check environment
    if (
      resolvedFlag.environments &&
      resolvedFlag.environments.length > 0
    ) {
      if (!resolvedFlag.environments.includes(context.environment.name)) {
        return {
          enabled: false,
          reason: `Feature not available in ${context.environment.name} environment`,
        };
      }
    }

    // 3. Check allowed roles
    if (
      resolvedFlag.allowedRoles &&
      resolvedFlag.allowedRoles.length > 0
    ) {
      if (!resolvedFlag.allowedRoles.includes(context.subject.role)) {
        return {
          enabled: false,
          reason: `Role '${context.subject.role}' not allowed for this feature`,
        };
      }
    }

    // 4. Check allowed users
    if (
      resolvedFlag.allowedUsers &&
      resolvedFlag.allowedUsers.length > 0
    ) {
      if (!resolvedFlag.allowedUsers.includes(context.subject.id)) {
        return {
          enabled: false,
          reason: `User not in allowed users list`,
        };
      }
    }

    // 5. Check rollout percentage
    const rollout = resolvedFlag.rolloutPercentage ?? 100;
    if (rollout < 100) {
      if (!RolloutHasher.isUserInRollout(context.subject.id, rollout)) {
        return {
          enabled: false,
          reason: `User not selected for ${rollout}% rollout`,
        };
      }
    }

    return {
      enabled: true,
      reason: "Feature enabled",
    };
  }

  /**
   * Evaluate multiple flags (ALL must pass)
   * Returns success only if all flags are enabled
   */
  evaluateAll(
    flags: FeatureFlag[],
    context: FeatureFlagContext
  ): FeatureFlagResult {
    if (!flags || flags.length === 0) {
      return {
        enabled: true,
        reason: "No flags to evaluate",
      };
    }

    for (const flag of flags) {
      const result = this.evaluate(flag, context);
      if (!result.enabled) {
        return result;
      }
    }

    return {
      enabled: true,
      reason: "All flags enabled",
    };
  }

  /**
   * Evaluate multiple flags (ANY can pass)
   * Returns success if at least one flag is enabled
   */
  evaluateAny(
    flags: FeatureFlag[],
    context: FeatureFlagContext
  ): FeatureFlagResult {
    if (!flags || flags.length === 0) {
      return {
        enabled: true,
        reason: "No flags to evaluate",
      };
    }

    const reasons: string[] = [];
    for (const flag of flags) {
      const result = this.evaluate(flag, context);
      if (result.enabled) {
        return result;
      }
      if (result.reason) {
        reasons.push(result.reason);
      }
    }

    return {
      enabled: false,
      reason: `All flags disabled: ${reasons.join("; ")}`,
    };
  }

  /**
   * Get all defined flags
   */
  getFlags(): Record<string, FeatureFlag> {
    return { ...this.flags };
  }

  /**
   * Clear the cache (useful for hot reloading)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get detailed evaluation information for debugging
   */
  getEvaluationDetails(
    flag: FeatureFlag,
    context: FeatureFlagContext
  ): string {
    const resolvedFlag = this.resolveFlag(flag);
    const parts: string[] = [];

    parts.push(`Flag: ${JSON.stringify(resolvedFlag, null, 2)}`);
    parts.push(`Context: ${JSON.stringify(context, null, 2)}`);

    const result = this.evaluate(resolvedFlag, context);
    parts.push(`Result: ${JSON.stringify(result, null, 2)}`);

    if (resolvedFlag.rolloutPercentage && resolvedFlag.rolloutPercentage < 100) {
      const userPercentage = RolloutHasher.calculateUserPercentage(
        context.subject.id
      );
      parts.push(
        `Rollout calculation: User ${context.subject.id} -> percentage ${userPercentage}%, required < ${resolvedFlag.rolloutPercentage}%`
      );
    }

    return parts.join("\n");
  }
}

/**
 * Create a feature flag evaluator with the given OpenAPI spec
 */
export function createFeatureFlagEvaluator(
  spec?: OpenAPISpec
): FeatureFlagEvaluator {
  return new FeatureFlagManager(spec);
}

/**
 * Export RolloutHasher for testing
 */
export { RolloutHasher };
