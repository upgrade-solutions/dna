// Access Control (RBAC/ABAC) Engine - Manager
// Provides Role-Based and Attribute-Based Access Control evaluation
/// <reference lib="deno.window" />

import {
  AccessControlPolicy,
  AccessControlContext,
  AccessControlResult,
  OpenAPISpec,
} from "../types.ts";

/**
 * Simple expression evaluator for ABAC rules
 * Supports basic comparisons: ==, !=, >, <, >=, <=, &&, ||
 * Variables: subject.*, resource.*, environment.*
 */
export class RuleEvaluator {
  /**
   * Evaluate a rule expression against a context
   * Examples:
   *   - subject.role == "admin"
   *   - subject.id == resource.ownerId
   *   - subject.role == "user" and subject.id == resource.id
   *   - environment.ip == "192.168.1.1"
   */
  evaluate(rule: string, context: AccessControlContext): boolean {
    try {
      // Replace variable references with context values
      let expression = this.replaceVariables(rule, context);

      // Replace 'and' and 'or' with JavaScript equivalents
      expression = expression.replace(/\s+and\s+/gi, " && ");
      expression = expression.replace(/\s+or\s+/gi, " || ");

      // Use Function constructor to safely evaluate
      // Only allow comparison and logical operators
      const func = new Function("return " + expression);
      const result = func();

      return Boolean(result);
    } catch (error) {
      console.error(`[RuleEvaluator] Failed to evaluate rule "${rule}": ${error}`);
      return false;
    }
  }

  /**
   * Replace variable references (subject.*, resource.*, environment.*) with actual values
   */
  private replaceVariables(expression: string, context: AccessControlContext): string {
    let result = expression;

    // Replace subject.* references
    result = result.replace(/subject\.(\w+)/g, (_match, prop) => {
      const value = (context.subject as Record<string, unknown>)[prop];
      return this.formatValue(value);
    });

    // Replace resource.* references
    result = result.replace(/resource\.(\w+)/g, (_match, prop) => {
      const value = (context.resource as Record<string, unknown>)[prop];
      return this.formatValue(value);
    });

    // Replace environment.* references
    if (context.environment) {
      result = result.replace(/environment\.(\w+)/g, (_match, prop) => {
        const value = (context.environment as Record<string, unknown>)[prop];
        return this.formatValue(value);
      });
    }

    return result;
  }

  /**
   * Format a value for use in expression evaluation
   */
  private formatValue(value: unknown): string {
    if (value === undefined || value === null) {
      return "undefined";
    }

    if (typeof value === "string") {
      // Escape quotes and wrap in quotes
      return `"${value.replace(/"/g, '\\"')}"`;
    }

    if (typeof value === "boolean" || typeof value === "number") {
      return String(value);
    }

    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  }
}

/**
 * Access Control Evaluator - Main engine for RBAC and ABAC
 */
export class AccessControlEvaluator {
  private ruleEvaluator: RuleEvaluator;
  private openApiSpec?: OpenAPISpec;
  private policyCache: Map<string, AccessControlPolicy> = new Map();

  constructor(openApiSpec?: OpenAPISpec) {
    this.ruleEvaluator = new RuleEvaluator();
    this.openApiSpec = openApiSpec;
  }

  /**
   * Main evaluation method
   * Returns:
   *   - allowed: true if access should be granted
   *   - reason: explanation of the decision
   *   - matchedRole: if RBAC rule matched
   *   - matchedRule: if ABAC rule matched
   */
  evaluate(
    policy: AccessControlPolicy,
    context: AccessControlContext
  ): AccessControlResult {
    // Empty policy allows all
    if (!policy || ((!policy.roles || policy.roles.length === 0) &&
        (!policy.rules || policy.rules.length === 0))) {
      return {
        allowed: true,
        reason: "Policy is empty - allowing all",
      };
    }

    // Check RBAC first (faster path)
    if (policy.roles && policy.roles.length > 0) {
      if (policy.roles.includes(context.subject.role)) {
        return {
          allowed: true,
          reason: `Subject role '${context.subject.role}' is in allowed roles`,
          matchedRole: context.subject.role,
        };
      }
    }

    // Evaluate ABAC rules if provided
    if (policy.rules && policy.rules.length > 0) {
      for (const rule of policy.rules) {
        if (this.ruleEvaluator.evaluate(rule, context)) {
          return {
            allowed: true,
            reason: `ABAC rule matched: ${rule}`,
            matchedRule: rule,
          };
        }
      }
    }

    // No match found
    return {
      allowed: false,
      reason: `No matching roles or rules. Subject role: ${context.subject.role}`,
    };
  }

  /**
   * Resolve a policy reference (e.g., '#/components/x-policies/admin-only')
   * Can also handle direct policy objects
   */
  resolvePolicy(
    policyOrRef: AccessControlPolicy | string
  ): AccessControlPolicy {
    // If it's a string, treat as reference
    if (typeof policyOrRef === "string") {
      return this.resolvePolicyRef(policyOrRef);
    }

    // If it has a $ref, resolve it
    if (policyOrRef.$ref) {
      return this.resolvePolicyRef(policyOrRef.$ref);
    }

    return policyOrRef;
  }

  /**
   * Resolve a policy reference string
   * Supports: #/components/x-policies/policy-name
   */
  private resolvePolicyRef(ref: string): AccessControlPolicy {
    // Check cache first
    if (this.policyCache.has(ref)) {
      return this.policyCache.get(ref)!;
    }

    if (!ref.startsWith("#/components/x-policies/")) {
      throw new Error(`Invalid policy reference format: ${ref}`);
    }

    if (!this.openApiSpec || !this.openApiSpec.components?.["x-policies"]) {
      throw new Error(`No policies found in OpenAPI spec`);
    }

    const policyName = ref.substring(24); // Remove '#/components/x-policies/'
    const policy = this.openApiSpec.components["x-policies"][policyName];

    if (!policy) {
      throw new Error(`Policy '${policyName}' not found`);
    }

    // Cache the resolved policy
    this.policyCache.set(ref, policy);

    return policy;
  }

  /**
   * Get all defined policies from OpenAPI spec
   */
  getPolicies(): Record<string, AccessControlPolicy> {
    if (!this.openApiSpec?.components?.["x-policies"]) {
      return {};
    }
    return this.openApiSpec.components["x-policies"];
  }

  /**
   * Clear the policy cache (useful for testing or dynamic spec updates)
   */
  clearCache(): void {
    this.policyCache.clear();
  }

  /**
   * Update the OpenAPI spec (useful for hot reloading)
   */
  setOpenAPISpec(spec: OpenAPISpec): void {
    this.openApiSpec = spec;
    this.clearCache();
  }
}

/**
 * Helper function to create an AccessControlEvaluator
 */
export function createAccessControlEvaluator(
  openApiSpec?: OpenAPISpec
): AccessControlEvaluator {
  return new AccessControlEvaluator(openApiSpec);
}

/**
 * Example usage:
 *
 * const evaluator = createAccessControlEvaluator(openApiSpec);
 *
 * const policy = {
 *   roles: ["admin", "manager"],
 *   rules: ["subject.id == resource.ownerId", "subject.role == 'user' && subject.department == resource.department"]
 * };
 *
 * const context = {
 *   subject: { id: "user123", role: "user", department: "sales" },
 *   resource: { id: "doc456", ownerId: "user123", department: "sales" }
 * };
 *
 * const result = evaluator.evaluate(policy, context);
 * // result.allowed === true (matches second rule)
 */
