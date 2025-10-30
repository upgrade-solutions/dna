// Configuration loader for YAML/JSON files
/// <reference types="https://deno.land/x/yaml@v0.4.0/mod.ts" />

import { parse as parseYaml } from "https://deno.land/std@0.208.0/yaml/mod.ts";
import { ApiConfig, RouteConfig, HandlerConfig, OpenAPISpec, OpenAPIOperation } from "./types.ts";

export interface ConfigLoaderOptions {
  configPath?: string;
  watch?: boolean;
}

/**
 * Interface for pluggable config sources (file, database, memory, etc.)
 */
export interface ConfigSource {
  load(): Promise<unknown>;
}

/**
 * File-based config source (default)
 */
export class FileConfigSource implements ConfigSource {
  constructor(private configPath: string = "./config/openapi.yaml") {}

  async load(): Promise<unknown> {
    try {
      const content = await Deno.readTextFile(this.configPath);
      const ext = this.configPath.split(".").pop()?.toLowerCase();

      if (ext === "yaml" || ext === "yml") {
        return parseYaml(content);
      } else if (ext === "json") {
        return JSON.parse(content);
      } else {
        throw new Error(`Unsupported config file format: ${ext}`);
      }
    } catch (error) {
      throw new Error(`Failed to load config from ${this.configPath}: ${error}`);
    }
  }
}

/**
 * In-memory config source for testing
 */
export class MemoryConfigSource implements ConfigSource {
  constructor(private spec: unknown) {}

  load(): Promise<unknown> {
    return Promise.resolve(this.spec);
  }
}

export class ConfigLoader {
  private configPath: string;
  private configSource: ConfigSource;
  private config: ApiConfig | null = null;
  private openApiSpec: OpenAPISpec | null = null;
  private watchers: ((config: ApiConfig) => void)[] = [];

  constructor(configPathOrSource: string | ConfigSource = "./config/openapi.yaml") {
    if (typeof configPathOrSource === "string") {
      this.configPath = configPathOrSource;
      this.configSource = new FileConfigSource(configPathOrSource);
    } else {
      this.configPath = "[custom source]";
      this.configSource = configPathOrSource;
    }
  }

  async load(): Promise<ApiConfig> {
    try {
      const spec = await this.configSource.load();

      // Check if this is an OpenAPI spec
      if ((spec as Record<string, unknown>).openapi) {
        this.openApiSpec = spec as OpenAPISpec;
        this.config = this.normalizeOpenAPISpec(this.openApiSpec);
      } else {
        // Fallback to legacy API config format
        this.config = spec as ApiConfig;
      }

      return this.config;
    } catch (error) {
      throw new Error(`Failed to load config: ${error}`);
    }
  }

  /**
   * Normalize OpenAPI spec into internal ApiConfig format
   * This adapter layer converts OpenAPI paths and operations into RouteConfig
   */
  private normalizeOpenAPISpec(spec: OpenAPISpec): ApiConfig {
    const routes: RouteConfig[] = [];
    const methods = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];

    for (const [path, pathItem] of Object.entries(spec.paths || {})) {
      for (const method of methods) {
        const operation = (pathItem as Record<string, unknown>)[method] as OpenAPIOperation | undefined;
        
        if (!operation || typeof operation !== "object") {
          continue;
        }

        // Extract handler config from x-handler extension
        const baseHandler = (operation["x-handler"] as HandlerConfig) || { type: "passthrough" };
        const handlerConfig: HandlerConfig = baseHandler.type 
          ? { ...baseHandler } 
          : { ...baseHandler, type: "passthrough" };

        // Add validation config if requestBody is present with schemas
        if (operation.requestBody?.content?.["application/json"]?.schema && !handlerConfig.validate) {
          handlerConfig.validate = {
            body: `#/components/schemas/${this.getSchemaRefName(operation.requestBody.content["application/json"].schema)}`,
          };
        }

        const route: RouteConfig = {
          path: this.convertOpenAPIPathToRoute(path),
          method: method.toUpperCase(),
          handler: handlerConfig,
          description: operation.description || operation.summary,
          auth: operation["x-auth"],
        };

        routes.push(route);
      }
    }

    return {
      name: spec.info.title,
      version: spec.info.version,
      routes,
    };
  }

  /**
   * Convert OpenAPI path format to internal route format
   * /users/{id} -> /users/:id
   */
  private convertOpenAPIPathToRoute(openApiPath: string): string {
    return openApiPath.replace(/{([^}]+)}/g, ":$1");
  }

  /**
   * Extract schema reference name from OpenAPI schema
   */
  private getSchemaRefName(schema: Record<string, unknown>): string {
    if (schema.$ref && typeof schema.$ref === "string") {
      return schema.$ref.split("/").pop() || "Unknown";
    }
    return "Inline";
  }

  /**
   * Get component schema from OpenAPI spec by reference
   * e.g., "#/components/schemas/User" -> User schema object
   */
  getComponentSchema(ref: string): Record<string, unknown> | null {
    if (!this.openApiSpec) {
      return null;
    }

    // Handle $ref format: #/components/schemas/SchemaName
    if (ref.startsWith("#/components/schemas/")) {
      const schemaName = ref.replace("#/components/schemas/", "");
      return this.openApiSpec.components?.schemas?.[schemaName] || null;
    }

    return null;
  }

  /**
   * Get all component schemas (useful for validator)
   */
  getComponentSchemas(): Record<string, Record<string, unknown>> {
    return this.openApiSpec?.components?.schemas || {};
  }

  /**
   * Get the raw OpenAPI spec
   */
  getOpenAPISpec(): OpenAPISpec | null {
    return this.openApiSpec;
  }

  async startWatcher(): Promise<void> {
    try {
      const watcher = Deno.watchFs([this.configPath]);

      for await (const event of watcher) {
        if (
          event.kind === "modify" &&
          event.paths.some((p) => p === this.configPath)
        ) {
          try {
            const newConfig = await this.load();
            this.notifyWatchers(newConfig);
            console.log(`[ConfigLoader] Configuration reloaded at ${new Date().toISOString()}`);
          } catch (error) {
            console.error(`[ConfigLoader] Failed to reload config: ${error}`);
          }
        }
      }
    } catch (error) {
      console.error(`[ConfigLoader] Watcher error: ${error}`);
    }
  }

  subscribe(callback: (config: ApiConfig) => void): void {
    this.watchers.push(callback);
  }

  private notifyWatchers(config: ApiConfig): void {
    for (const watcher of this.watchers) {
      watcher(config);
    }
  }

  getConfig(): ApiConfig | null {
    return this.config;
  }

  async loadSchema(schemaPath: string): Promise<Record<string, unknown>> {
    try {
      // Handle component schema references
      if (schemaPath.startsWith("#/components/schemas/")) {
        const schema = this.getComponentSchema(schemaPath);
        if (schema) {
          return schema;
        }
        throw new Error(`Schema not found: ${schemaPath}`);
      }

      // Handle file paths
      const content = await Deno.readTextFile(schemaPath);
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load schema from ${schemaPath}: ${error}`);
    }
  }

  async loadScript(scriptPath: string): Promise<string> {
    try {
      return await Deno.readTextFile(scriptPath);
    } catch (error) {
      throw new Error(`Failed to load script from ${scriptPath}: ${error}`);
    }
  }
}

export function createConfigLoader(
  configPath: string = "./config/openapi.yaml"
): ConfigLoader {
  return new ConfigLoader(configPath);
}
