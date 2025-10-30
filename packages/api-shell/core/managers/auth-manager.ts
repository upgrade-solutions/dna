// Authorization module supporting RBAC and ABAC

import { AuthRule, ExecutionContext } from "../types.ts";

export interface AuthContext {
  user?: {
    id: string;
    role: string | string[];
    permissions?: string[];
  };
  org?: string;
}

export class AuthManager {
  async authorize(
    ctx: ExecutionContext,
    rule?: AuthRule
  ): Promise<boolean> {
    // If no auth rule, allow access
    if (!rule) {
      return true;
    }

    const authCtx = this.extractAuthContext(ctx);

    // Check role-based access
    if (rule.role) {
      const userRole = authCtx.user?.role;
      if (!userRole) {
        return false;
      }

      const allowedRoles = Array.isArray(rule.role)
        ? rule.role
        : [rule.role];

      const userRoles = Array.isArray(userRole)
        ? userRole
        : [userRole];

      const hasRole = userRoles.some((role) =>
        allowedRoles.includes(role)
      );

      if (!hasRole) {
        return false;
      }
    }

    // Check permission-based access
    if (rule.permission) {
      const userPermissions = authCtx.user?.permissions || [];
      const requiredPermissions = Array.isArray(rule.permission)
        ? rule.permission
        : [rule.permission];

      const hasPermission = requiredPermissions.some((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        return false;
      }
    }

    // Additional ABAC condition evaluation
    if (rule.condition) {
      return this.evaluateCondition(rule.condition, authCtx);
    }

    return true;
  }

  private extractAuthContext(ctx: ExecutionContext): AuthContext {
    // Extract from Authorization header or user context
    const authCtx: AuthContext = {};

    if (ctx.user) {
      authCtx.user = ctx.user as AuthContext["user"];
    }

    // Could also parse Authorization header here
    return authCtx;
  }

  private evaluateCondition(condition: string, ctx: AuthContext): boolean {
    // Simple condition evaluation - can be extended with expression engine
    // For now, just support basic checks like "has_permission:admin"
    if (condition.startsWith("has_permission:")) {
      const permission = condition.replace("has_permission:", "");
      return ctx.user?.permissions?.includes(permission) || false;
    }

    if (condition.startsWith("has_role:")) {
      const role = condition.replace("has_role:", "");
      const userRoles = Array.isArray(ctx.user?.role)
        ? ctx.user.role
        : [ctx.user?.role];
      return userRoles.includes(role);
    }

    return true;
  }

  createAuthContext(user?: AuthContext["user"]): AuthContext {
    return { user };
  }
}

export function createAuthManager(): AuthManager {
  return new AuthManager();
}
