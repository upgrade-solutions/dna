// Type definitions for the API Shell

export interface ExecutionContext {
  request: Request;
  params: Record<string, string>;
  body: unknown;
  user?: unknown;
  env: Record<string, string>;
  resourceAction?: ResourceActionContext;
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
  "x-resource-action"?: string; // e.g., "user:read", "document:delete"
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

/**
 * Resource-Action context with class-level and instance-level granularity
 * Dual-level design distinguishes between:
 * - CLASS-LEVEL: What capability is being exercised (e.g., "user:read")
 * - INSTANCE-LEVEL: What specific target is affected (e.g., user ID 123, optional scope)
 */
export interface ResourceActionContext {
  // CLASS-LEVEL: Used for policy/capability checks
  resource: string; // e.g., "user", "document", "report"
  action: string; // e.g., "read", "update", "delete", "create"
  canonical: string; // Canonical form: "user:read"

  // INSTANCE-LEVEL: Enriched at runtime from route params/context
  targetId?: string; // Target resource ID (e.g., user ID from {id} param)
  targetScope?: string; // Optional scope qualifier (e.g., "department", "team", "field")

  // COMPUTED: Full qualified form for audit trails and instance-specific logic
  qualifiedForm(): string;
}

/**
 * Implementation of ResourceActionContext with computed qualified form
 */
export class ResourceActionImpl implements ResourceActionContext {
  resource: string;
  action: string;
  canonical: string;
  targetId?: string;
  targetScope?: string;

  constructor(
    resource: string,
    action: string,
    targetId?: string,
    targetScope?: string
  ) {
    this.resource = resource;
    this.action = action;
    this.canonical = `${resource}:${action}`;
    this.targetId = targetId;
    this.targetScope = targetScope;
  }

  qualifiedForm(): string {
    if (this.targetId) {
      if (this.targetScope) {
        return `${this.resource}:${this.targetId}:${this.targetScope}:${this.action}`;
      }
      return `${this.resource}:${this.targetId}:${this.action}`;
    }
    return this.canonical;
  }
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

// ============================================================================
// COMPOSABLE BLOCKS SYSTEM
// ============================================================================

/**
 * Block Input Definition
 * Describes what data a block expects as input
 */
export interface BlockInput {
  name: string;
  type: string; // "string", "number", "boolean", "object", "array"
  required?: boolean;
  default?: unknown;
  description?: string;
  source?: "param" | "previous" | "literal" | "env"; // Where the input comes from
}

/**
 * Block Output Definition
 * Describes what data a block produces
 */
export interface BlockOutput {
  name: string;
  type: string;
  description?: string;
  schema?: Record<string, unknown>; // JSON Schema for complex types
}

/**
 * Block Configuration
 * Base configuration for any block type
 */
export interface BlockConfig {
  [key: string]: unknown;
}

/**
 * Block Definition
 * Reusable blueprint for a block type (Database, HTTP, File, etc.)
 */
export interface BlockDefinition {
  id: string; // Unique identifier
  type: string; // "database", "http", "file", "transform", "condition", etc.
  description?: string;
  config: BlockConfig; // Provider-specific configuration
  inputs: BlockInput[]; // Expected inputs
  outputs: BlockOutput[]; // Produced outputs
  functions?: string[]; // Available functions (e.g., ["select", "insert"])
  timeout?: number; // Execution timeout in ms
}

/**
 * Block Instance
 * Configured instance of a block ready for execution
 */
export interface BlockInstance {
  id: string; // Instance ID (unique in chain)
  blockType: string; // Type reference (e.g., "database", "http")
  ref?: string; // Reference to block definition (e.g., "#/components/x-blocks/mainDb")
  config: Record<string, unknown>; // Instance configuration
  inputs: Record<string, unknown>; // Input mapping and values
  errorHandler?: "fail" | "skip" | "retry" | "fallback";
  retryPolicy?: {
    maxAttempts: number;
    backoff: "none" | "linear" | "exponential";
    retryDelay?: string; // ISO 8601 duration
  };
  timeout?: number; // Override timeout for this instance
  fallback?: unknown; // Fallback value if block fails
  parallel?: boolean; // Run in parallel with other blocks
  outputs?: Record<string, string>; // Output mapping (e.g., { "result": "$" })
}

/**
 * Block Chain
 * Ordered sequence of blocks to be executed
 */
export interface BlockChain {
  id: string;
  blocks: BlockInstance[];
  errorHandling?: {
    strategy: "fail-fast" | "continue";
    defaultFallback?: unknown;
  };
  timeout?: number; // Total chain timeout
}

/**
 * Block Execution Context
 * Runtime context provided to each block during execution
 */
export interface BlockExecutionContext {
  // Direct inputs to this block
  inputs: Record<string, unknown>;

  // Contextual information
  env: Record<string, string>; // Environment variables
  user?: unknown; // Authenticated user
  params: Record<string, string>; // URL parameters
  requestBody?: unknown; // Original request body

  // Previous block outputs in the chain
  blockOutputs: Record<string, Record<string, unknown>>; // { blockId: { outputName: value } }

  // Block metadata
  blockId: string; // Current block ID
  blockType: string; // Current block type
  chainId: string; // Parent chain ID

  // Execution metadata
  currentBlockIndex: number;
  totalBlocks: number;
  executedAt: Date;
}

/**
 * Block Execution Result
 * Output from executing a single block
 */
export interface BlockExecutionResult {
  blockId: string;
  blockType: string;
  success: boolean;
  outputs: Record<string, unknown>;
  error?: Error;
  duration: number; // ms
  timestamp: Date;
}

/**
 * Block Chain Execution Result
 * Aggregated result from executing all blocks in a chain
 */
export interface BlockChainExecutionResult {
  chainId: string;
  success: boolean;
  results: BlockExecutionResult[];
  outputs: Record<string, unknown>; // Aggregated outputs from all blocks
  error?: Error;
  totalDuration: number; // ms
  timestamp: Date;
}

/**
 * Block Registry Entry
 * Stores block definitions for reuse
 */
export interface BlockRegistryEntry {
  definition: BlockDefinition;
  handler: BlockHandler;
}

/**
 * Block Handler Function
 * Function that executes a block
 */
export type BlockHandler = (
  ctx: BlockExecutionContext,
  config: BlockConfig
) => Promise<Record<string, unknown>>;

/**
 * Block Instance Configuration in OpenAPI
 * Can use $ref to reference block definitions or inline config
 */
export interface BlockInstanceConfig {
  id: string;
  ref?: string; // e.g., "#/components/x-blocks/database"
  type?: string; // Alternative to ref, inline type
  config?: Record<string, unknown>;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, string>; // Output extraction mappings
  errorHandler?: string;
  parallel?: boolean;
}

/**
 * OpenAPI Components Extension for Blocks
 * Added to components section
 */
export interface OpenAPIComponentsBlocks {
  "x-blocks"?: Record<string, BlockDefinition>;
  "x-block-chains"?: Record<string, BlockChain>;
}

/**
 * Handler Configuration for Blocks
 * Used in x-handler extension to execute a block chain
 */
export interface BlocksHandlerConfig extends HandlerConfig {
  type: "blocks";
  chain: string; // Chain ID to execute
  chainDefinition?: BlockChain; // Inline chain definition
  responseKey?: string; // Which block output to return (e.g., "blocks.transformStep.result")
}

/**
 * Utility: Extract nested value from object using dot notation
 * e.g., "blocks.getUserData.user" or "rows[0].id"
 */
export function extractValue(
  data: Record<string, unknown>,
  path: string
): unknown {
  const parts = path.split(".");
  let current: unknown = data;

  for (const part of parts) {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }

    // Handle array index syntax: "items[0]"
    const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      const array = (current as Record<string, unknown>)[key];
      if (Array.isArray(array)) {
        current = array[parseInt(index)];
      } else {
        return undefined;
      }
    } else {
      current = (current as Record<string, unknown>)[part];
    }
  }

  return current;
}

/**
 * Utility: Set nested value in object using dot notation
 * e.g., "user.profile.name"
 */
export function setValue(
  data: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const parts = path.split(".");
  let current: unknown = data;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in (current as Record<string, unknown>))) {
      (current as Record<string, unknown>)[part] = {};
    }
    current = (current as Record<string, unknown>)[part];
  }

  const lastPart = parts[parts.length - 1];
  (current as Record<string, unknown>)[lastPart] = value;
}

