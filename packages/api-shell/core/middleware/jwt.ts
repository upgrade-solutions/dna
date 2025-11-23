// JWT Authentication Middleware
// Extracts and decodes JWT tokens from Authorization header
/// <reference lib="deno.window" />

/**
 * Simple JWT decoder without verification (for development/testing)
 * In production, you should use a proper JWT library with signature verification
 */
export function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (base64url)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("[JWT] Failed to decode token:", error);
    return null;
  }
}

/**
 * JWT Authentication Middleware
 * Extracts JWT from Authorization header and populates ctx.state.user
 */
export function createJWTMiddleware(options?: {
  required?: boolean;
  headerName?: string;
}) {
  const required = options?.required ?? false;
  const headerName = options?.headerName ?? "authorization";

  // deno-lint-ignore no-explicit-any
  return async (ctx: any, next: any) => {
    // Extract token from Authorization header
    const authHeader = ctx.request.headers.get(headerName);
    
    if (!authHeader) {
      if (required) {
        ctx.response.status = 401;
        ctx.response.body = {
          error: "Unauthorized",
          message: "Missing authorization header",
        };
        return;
      }
      await next();
      return;
    }

    // Extract bearer token
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      if (required) {
        ctx.response.status = 401;
        ctx.response.body = {
          error: "Unauthorized",
          message: "Invalid authorization header format. Expected: Bearer <token>",
        };
        return;
      }
      await next();
      return;
    }

    const token = match[1];

    // Decode JWT (without verification for now)
    const payload = decodeJWT(token);
    
    if (!payload) {
      if (required) {
        ctx.response.status = 401;
        ctx.response.body = {
          error: "Unauthorized",
          message: "Invalid JWT token",
        };
        return;
      }
      await next();
      return;
    }

    // Populate ctx.state.user with decoded payload
    if (!ctx.state) {
      ctx.state = {};
    }
    ctx.state.user = payload;

    console.log(`[JWT] Authenticated user: ${payload.id} (role: ${payload.role})`);

    await next();
  };
}

/**
 * Example usage:
 * 
 * import { createJWTMiddleware } from "./core/middleware/jwt.ts";
 * 
 * // Add to your application
 * const jwtMiddleware = createJWTMiddleware({ required: false });
 * app.use(jwtMiddleware);
 * 
 * // Now ctx.state.user will contain the decoded JWT payload
 */
