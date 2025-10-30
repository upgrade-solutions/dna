// Dynamic router for registering routes from configuration

import {
  Router,
  Context,
} from "https://deno.land/x/oak@v12.6.1/mod.ts";
import {
  ExecutionContext,
  RouteConfig,
  AccessControlPolicy,
  AccessControlContext,
} from "./types.ts";
import { HandlerRegistry, AuthManager } from "./managers/index.ts";
import { SchemaValidator } from "./validator.ts";
import { ConfigLoader } from "./loader.ts";
import {
  AccessControlEvaluator,
  createAccessControlEvaluator,
} from "./managers/access-control-manager.ts";

export class DynamicRouter {
  private router: Router;
  private handlers: HandlerRegistry;
  private auth: AuthManager;
  private validator: SchemaValidator;
  private configLoader: ConfigLoader;
  private accessControl: AccessControlEvaluator;
  private schemaCache: Map<string, Record<string, unknown>> = new Map();

  constructor(
    router: Router,
    handlers: HandlerRegistry,
    auth: AuthManager,
    validator: SchemaValidator,
    configLoader: ConfigLoader,
    accessControl?: AccessControlEvaluator
  ) {
    this.router = router;
    this.handlers = handlers;
    this.auth = auth;
    this.validator = validator;
    this.configLoader = configLoader;
    const spec = configLoader.getOpenAPISpec();
    this.accessControl = accessControl || createAccessControlEvaluator(spec || undefined);
  }

  async registerRoutes(routes: RouteConfig[]): Promise<void> {
    for (const route of routes) {
      await this.registerRoute(route);
    }
  }

  private registerRoute(route: RouteConfig): void {
    const method = route.method.toLowerCase();

    const handler = async (ctx: Context) => {
      try {
        // Extract execution context
        const executionCtx = this.createExecutionContext(
          // deno-lint-ignore no-explicit-any
          ctx as any,
          route
        );

        // Get access control policy from OpenAPI if available
        const policy = this.getAccessControlPolicy(route);

        // Access Control check (happens before regular auth)
        if (policy) {
          const acContext = this.buildAccessControlContext(executionCtx);
          if (!acContext) {
            ctx.response.status = 401;
            ctx.response.body = {
              error: "Unauthorized",
              message: "Could not determine access context",
            };
            return;
          }

          const acResult = this.accessControl.evaluate(policy, acContext);
          if (!acResult.allowed) {
            ctx.response.status = 403;
            ctx.response.body = {
              error: "Forbidden",
              message: `Access denied: ${acResult.reason}`,
            };
            return;
          }
        }

        // Authorization check (legacy x-auth)
        const authorized = await this.auth.authorize(
          executionCtx,
          route.auth
        );
        if (!authorized) {
          ctx.response.status = 403;
          ctx.response.body = {
            error: "Forbidden",
            message: "You do not have permission to access this resource",
          };
          return;
        }

        // Parse request body if needed
        if (!executionCtx.body && ctx.request.hasBody) {
          executionCtx.body = await ctx.request.body({ type: "json" }).value;
        }

        // Validation
        if (route.handler.validate) {
          const validationErrors = await this.validateRequest(
            executionCtx,
            route.handler.validate
          );
          if (validationErrors.length > 0) {
            ctx.response.status = 400;
            ctx.response.body = {
              error: "Validation Error",
              messages: validationErrors,
            };
            return;
          }
        }

        // Execute handler
        const result = await this.handlers.execute(
          route.handler.type,
          executionCtx,
          route.handler
        );

        // deno-lint-ignore no-explicit-any
        ctx.response.body = (result as any);
      } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = {
          error: "Internal Server Error",
          message: error instanceof Error ? error.message : String(error),
        };
      }
    };

    // Register with Oak router
    switch (method) {
      case "get":
        this.router.get(route.path, handler);
        break;
      case "post":
        this.router.post(route.path, handler);
        break;
      case "put":
        this.router.put(route.path, handler);
        break;
      case "patch":
        this.router.patch(route.path, handler);
        break;
      case "delete":
        this.router.delete(route.path, handler);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  private async validateRequest(
    ctx: ExecutionContext,
    validateRules: Record<string, string>
  ): Promise<string[]> {
    const errors: string[] = [];

    // Validate body
    if (validateRules.body) {
      const schema = await this.loadSchema(validateRules.body);
      const result = this.validator.validate(ctx.body, schema);
      if (!result.valid && result.errors) {
        errors.push(...result.errors);
      }
    }

    // Validate params
    if (validateRules.params) {
      const schema = await this.loadSchema(validateRules.params);
      const result = this.validator.validate(ctx.params, schema);
      if (!result.valid && result.errors) {
        errors.push(...result.errors);
      }
    }

    return errors;
  }

  private async loadSchema(
    schemaPath: string
  ): Promise<Record<string, unknown>> {
    if (this.schemaCache.has(schemaPath)) {
      return this.schemaCache.get(schemaPath)!;
    }

    const schema = await this.configLoader.loadSchema(schemaPath);
    this.schemaCache.set(schemaPath, schema);
    return schema;
  }

  private createExecutionContext(
    // deno-lint-ignore no-explicit-any
    ctx: any,
    _route: RouteConfig
  ): ExecutionContext {
    return {
      request: ctx.request,
      params: ctx.params,
      body: undefined, // Will be populated after this if needed
      user: (ctx.state as Record<string, unknown>).user,
      env: Deno.env.toObject(),
      respond: (data: unknown, status = 200) => {
        ctx.response.status = status;
        // deno-lint-ignore no-explicit-any
        ctx.response.body = data as any;
        return new Response(JSON.stringify(data), {
          status,
          headers: { "Content-Type": "application/json" },
        });
      },
    };
  }

  /**
   * Get access control policy from route handler config
   * First checks for x-access-control, then falls back to x-auth
   */
  private getAccessControlPolicy(
    route: RouteConfig
  ): AccessControlPolicy | undefined {
    const handler = route.handler as Record<string, unknown>;

    // Check if handler config has x-access-control (from OpenAPI spec via loader)
    if (handler["x-access-control"]) {
      return handler["x-access-control"] as AccessControlPolicy;
    }

    return undefined;
  }

  /**
   * Build AccessControlContext from ExecutionContext
   * Extracts subject (user), resource, and environment information
   */
  private buildAccessControlContext(
    ctx: ExecutionContext
  ): AccessControlContext | null {
    const user = ctx.user as Record<string, unknown> | undefined;

    // If no user information available, return null
    if (!user || !user.id || !user.role) {
      return null;
    }

    return {
      subject: {
        id: user.id as string,
        role: user.role as string,
        department: user.department as string | undefined,
        permissions: user.permissions as string[] | undefined,
      },
      resource: {
        id: ((ctx.params as Record<string, unknown>).id as string) || "",
        ownerId: user.ownerId as string | undefined,
      },
      environment: {
        timestamp: Date.now(),
      },
    };
  }

  getRouter(): Router {
    return this.router;
  }
}

export function createRouter(
  handlers: HandlerRegistry,
  auth: AuthManager,
  validator: SchemaValidator,
  configLoader: ConfigLoader
): DynamicRouter {
  const router = new Router();
  return new DynamicRouter(router, handlers, auth, validator, configLoader);
}
