// Type definitions for the API Shell

export interface ExecutionContext {
  request: Request;
  params: Record<string, string>;
  body: unknown;
  user?: unknown;
  env: Record<string, string>;
  respond: (data: unknown, status?: number) => Response;
}

export interface RouteConfig {
  path: string;
  method: string;
  handler: HandlerConfig;
  auth?: AuthRule;
  description?: string;
}

export interface HandlerConfig {
  type: string;
  validate?: {
    body?: string;
    params?: string;
    query?: string;
  };
  [key: string]: unknown;
}

export interface AuthRule {
  role?: string | string[];
  permission?: string | string[];
  condition?: string;
}

export interface ApiConfig {
  name: string;
  version: string;
  routes: RouteConfig[];
}

export type HandlerFunction = (
  ctx: ExecutionContext,
  config: HandlerConfig
) => Promise<unknown>;

export interface ValidationSchema {
  type?: string;
  properties?: Record<string, unknown>;
  required?: string[];
  [key: string]: unknown;
}

// OpenAPI 3.1.1 Support Types
export interface OpenAPISpec {
  openapi: string;
  info: OpenAPIInfo;
  servers?: OpenAPIServer[];
  paths: Record<string, OpenAPIPathItem>;
  components?: OpenAPIComponents;
  security?: Record<string, string[]>[];
  tags?: OpenAPITag[];
  [key: string]: unknown;
}

export interface OpenAPIInfo {
  title: string;
  version: string;
  description?: string;
  contact?: Record<string, unknown>;
  license?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface OpenAPIServer {
  url: string;
  description?: string;
  variables?: Record<string, unknown>;
}

export interface OpenAPIPathItem {
  [method: string]: OpenAPIOperation | OpenAPIParameter[] | string | undefined;
  get?: OpenAPIOperation;
  post?: OpenAPIOperation;
  put?: OpenAPIOperation;
  patch?: OpenAPIOperation;
  delete?: OpenAPIOperation;
  head?: OpenAPIOperation;
  options?: OpenAPIOperation;
  trace?: OpenAPIOperation;
  parameters?: OpenAPIParameter[];
  summary?: string;
  description?: string;
}

export interface OpenAPIOperation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses: Record<string, OpenAPIResponse>;
  security?: Record<string, string[]>[];
  deprecated?: boolean;
  "x-handler"?: HandlerConfig;
  "x-auth"?: AuthRule;
  "x-access-control"?: AccessControlPolicy;
  "x-feature-flags"?: FeatureFlag[];
  [key: string]: unknown;
}

export interface OpenAPIParameter {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  schema?: OpenAPISchema;
  [key: string]: unknown;
}

export interface OpenAPIRequestBody {
  description?: string;
  required?: boolean;
  content: Record<string, { schema?: OpenAPISchema }>;
}

export interface OpenAPIResponse {
  description: string;
  content?: Record<string, { schema?: OpenAPISchema }>;
  headers?: Record<string, unknown>;
}

export interface OpenAPISchema {
  $ref?: string;
  type?: string;
  format?: string;
  properties?: Record<string, OpenAPISchema>;
  required?: string[];
  items?: OpenAPISchema;
  enum?: unknown[];
  default?: unknown;
  description?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  [key: string]: unknown;
}

export interface OpenAPIComponents {
  schemas?: Record<string, OpenAPISchema>;
  securitySchemes?: Record<string, OpenAPISecurityScheme>;
  responses?: Record<string, OpenAPIResponse>;
  parameters?: Record<string, OpenAPIParameter>;
  "x-policies"?: Record<string, AccessControlPolicy>;
  "x-flags"?: Record<string, FeatureFlag>;
  [key: string]: unknown;
}

export interface OpenAPISecurityScheme {
  type: "apiKey" | "http" | "mutualTLS" | "oauth2" | "openIdConnect";
  description?: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
  flows?: Record<string, unknown>;
  openIdConnectUrl?: string;
  [key: string]: unknown;
}

export interface OpenAPITag {
  name: string;
  description?: string;
  externalDocs?: Record<string, unknown>;
}

// Access Control (RBAC/ABAC) Extension Types
/**
 * Access control policy for RBAC (Role-Based) and ABAC (Attribute-Based) access control
 */
export interface AccessControlPolicy {
  description?: string;
  roles?: string[]; // RBAC: allowed roles
  rules?: string[]; // ABAC: conditional expressions
  $ref?: string; // Support for policy references
  [key: string]: unknown;
}

/**
 * Runtime context for access control evaluation
 */
export interface AccessControlContext {
  subject: {
    id: string;
    role: string;
    department?: string;
    permissions?: string[];
    [key: string]: unknown;
  };
  resource: {
    id: string;
    ownerId?: string;
    type?: string;
    [key: string]: unknown;
  };
  environment?: {
    ip?: string;
    timeOfDay?: string;
    timestamp?: number;
    [key: string]: unknown;
  };
}

/**
 * Result of access control evaluation
 */
export interface AccessControlResult {
  allowed: boolean;
  reason?: string;
  matchedRole?: string;
  matchedRule?: string;
}

/**
 * Parsed rule expression for ABAC evaluation
 */
export interface ParsedRule {
  raw: string;
  ast?: unknown; // Abstract syntax tree if using a parser
}

// Feature Flags (x-feature-flags) Extension Types
/**
 * Feature flag configuration for toggling features
 */
export interface FeatureFlag {
  description?: string;
  enabled: boolean;
  allowedRoles?: string[]; // Roles that can access this feature
  allowedUsers?: string[]; // Specific users that can access
  environments?: string[]; // Environments where feature is available
  rolloutPercentage?: number; // Percentage-based rollout (0-100)
  $ref?: string; // Support for flag references
  [key: string]: unknown;
}

/**
 * Runtime context for feature flag evaluation
 */
export interface FeatureFlagContext {
  subject: {
    id: string;
    role: string;
    [key: string]: unknown;
  };
  environment: {
    name: string; // e.g., "production", "staging", "development"
    [key: string]: unknown;
  };
}

/**
 * Result of feature flag evaluation
 */
export interface FeatureFlagResult {
  enabled: boolean;
  reason?: string;
  matchedRule?: string;
}
