#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env --allow-hrtime
// Main entry point for the Configuration-Driven API Shell

import { Application, Router } from "oak";
import { ConfigLoader } from "./core/loader.ts";
import { HandlerRegistry, AuthManager } from "./core/managers/index.ts";
import { SchemaValidator } from "./core/validator.ts";
import { DynamicRouter } from "./core/router.ts";
import { validateSpecContracts } from "./core/spec_contract.ts";
import { createStructuredLoggingMiddleware } from "./core/middleware/structured-logging.ts";

// Import handlers
import { handleCrud } from "./core/handlers/crud.ts";
import { handleQuery } from "./core/handlers/query.ts";
import { handleProxy } from "./core/handlers/proxy.ts";
import { handleScript } from "./core/handlers/script.ts";
import { handleFormula } from "./core/handlers/formula.ts";
import { handlePassthrough } from "./core/handlers/passthrough.ts";

// Configuration
const configPath =
  Deno.env.get("CONFIG_PATH") || "./config/openapi.yaml";
const port = parseInt(Deno.env.get("PORT") || "3000");
const hostname = Deno.env.get("HOSTNAME") || "127.0.0.1";

async function main() {
  console.log(`🧬 API Shell - Configuration-Driven API Server`);
  console.log(`📂 Loading configuration from: ${configPath}`);

  // Initialize core components
  const configLoader = new ConfigLoader(configPath);
  const handlerRegistry = new HandlerRegistry();
  const authManager = new AuthManager();
  const validator = new SchemaValidator(configLoader);

  // Register built-in handlers
  // deno-lint-ignore no-explicit-any
  handlerRegistry.register("crud", handleCrud as any);
  // deno-lint-ignore no-explicit-any
  handlerRegistry.register("query", handleQuery as any);
  // deno-lint-ignore no-explicit-any
  handlerRegistry.register("proxy", handleProxy as any);
  // deno-lint-ignore no-explicit-any
  handlerRegistry.register("script", handleScript as any);
  // deno-lint-ignore no-explicit-any
  handlerRegistry.register("formula", handleFormula as any);
  // deno-lint-ignore no-explicit-any
  handlerRegistry.register("passthrough", handlePassthrough as any);

  console.log(
    `✅ Registered handlers: ${handlerRegistry.listHandlers().join(", ")}`
  );

  // Load configuration (including OpenAPI spec)
  let config = await configLoader.load();
  console.log(`✅ Configuration loaded: ${config.name} v${config.version}`);
  console.log(`📍 Routes: ${config.routes.length}`);

  // Get the OpenAPI spec if available
  const openApiSpec = configLoader.getOpenAPISpec();
  if (openApiSpec) {
    console.log(`📄 OpenAPI spec version: ${openApiSpec.openapi}`);

    // Validate spec contracts
    console.log(`🔍 Validating spec contracts...`);
    const validation = validateSpecContracts(openApiSpec);

    if (!validation.valid) {
      console.error(`❌ Spec validation failed:`);
      for (const error of validation.allErrors) {
        console.error(`   - ${error}`);
      }
      Deno.exit(1);
    }

    console.log(`✅ Spec contracts validated successfully`);
  }

  // Create Oak application
  const app = new Application();
  const oakRouter = new Router();

  // Add structured logging middleware
  const loggingLevel = Deno.env.get("LOG_LEVEL") || "INFO";
  const includeLoggingBodies = Deno.env.get("LOG_INCLUDE_BODIES") === "true";
  
  const loggingMiddleware = createStructuredLoggingMiddleware({
    service: "api-shell",
    environment: Deno.env.get("ENVIRONMENT") || "development",
    level: loggingLevel as "DEBUG" | "INFO" | "WARN" | "ERROR",
    includeDetails: includeLoggingBodies,
    outputToConsole: Deno.env.get("LOG_TO_CONSOLE") !== "false",
    outputToFile: Deno.env.get("LOG_TO_FILE") === "true",
    logFilePath: Deno.env.get("LOG_FILE_PATH") || "./logs/api-shell.jsonl",
  });

  app.use(loggingMiddleware.middleware());

  // Optionally add secondary JSON logging for redundancy
  if (Deno.env.get("ENABLE_SECONDARY_LOGGING") === "true") {
    const secondaryLogger = createStructuredLoggingMiddleware({
      service: "api-shell",
      environment: Deno.env.get("ENVIRONMENT") || "development",
      level: (Deno.env.get("LOG_LEVEL") || "INFO") as "DEBUG" | "INFO" | "WARN" | "ERROR",
      includeDetails: Deno.env.get("LOG_INCLUDE_BODIES") === "true",
      outputToConsole: false,
      outputToFile: true,
      logFilePath: Deno.env.get("LOG_FILE_PATH_2") || "./logs/api-shell-backup.jsonl",
    });
    app.use(secondaryLogger.middleware());
    console.log(`📊 Secondary logging enabled at ${Deno.env.get("LOG_FILE_PATH_2") || "./logs/api-shell-backup.jsonl"}`);
  }
  const dynamicRouter = new DynamicRouter(
    oakRouter,
    handlerRegistry,
    authManager,
    validator,
    configLoader
  );

  // Register initial routes
  await dynamicRouter.registerRoutes(config.routes);
  console.log(`🚀 Routes registered`);

  // Add middleware
  // deno-lint-ignore no-explicit-any
  app.use(async (ctx: any, next: any) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.response.headers.set("X-Response-Time", `${ms}ms`);
  });

  // Add error handling middleware
  // deno-lint-ignore no-explicit-any
  app.use(async (ctx: any, next: any) => {
    try {
      await next();
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error),
      };
    }
  });

  // Use the router
  app.use(dynamicRouter.getRouter().routes());
  app.use(dynamicRouter.getRouter().allowedMethods());

  // Health check endpoint
  const healthRouter = new Router();
  // deno-lint-ignore no-explicit-any
  healthRouter.get("/health", (ctx: any) => {
    ctx.response.body = {
      status: "healthy",
      api: config.name,
      version: config.version,
      timestamp: new Date().toISOString(),
    };
  });

  // OpenAPI spec endpoint
  // deno-lint-ignore no-explicit-any
  healthRouter.get("/openapi.json", (ctx: any) => {
    if (openApiSpec) {
      ctx.response.type = "application/json";
      ctx.response.body = openApiSpec;
    } else {
      ctx.response.status = 404;
      ctx.response.body = {
        error: "Not Found",
        message: "OpenAPI specification not available",
      };
    }
  });

  // OpenAPI YAML endpoint (for convenience)
  // deno-lint-ignore no-explicit-any
  healthRouter.get("/openapi.yaml", (ctx: any) => {
    if (configLoader.getOpenAPISpec()) {
      ctx.response.type = "text/yaml";
      // Return the raw YAML - in production you might want to read from file
      ctx.response.body = "See /openapi.json for OpenAPI specification in JSON format";
    } else {
      ctx.response.status = 404;
      ctx.response.body = {
        error: "Not Found",
        message: "OpenAPI specification not available",
      };
    }
  });

  // Swagger UI documentation endpoint
  // deno-lint-ignore no-explicit-any
  healthRouter.get("/docs", (ctx: any) => {
    ctx.response.type = "text/html";
    ctx.response.body = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${config.name} - ${config.version}" />
    <title>${config.name} API Documentation</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    <style>
      html {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }
      *,
      *:before,
      *:after {
        box-sizing: inherit;
      }
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js" crossorigin></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: "/openapi.json",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout"
        });
      };
    </script>
  </body>
</html>
    `;
  });

  app.use(healthRouter.routes());
  app.use(healthRouter.allowedMethods());

  // Watch for configuration changes (optional)
  if (Deno.env.get("WATCH_CONFIG") === "true") {
    console.log(`👀 Watching for configuration changes...`);
    configLoader.subscribe((newConfig) => {
      config = newConfig;
      console.log(`🔄 Reloading routes...`);
      // In a real implementation, we would dynamically re-register routes
    });

    // Start file watcher in background
    configLoader.startWatcher().catch((error) => {
      console.error(`[ConfigLoader] Error: ${error}`);
    });
  }

  // Start server
  console.log(`\n🎉 API Shell starting...`);
  console.log(`   URL: http://${hostname}:${port}`);
  console.log(`   Health: http://${hostname}:${port}/health`);
  console.log(`   📚 Docs: http://${hostname}:${port}/docs`);
  console.log(`   OpenAPI: http://${hostname}:${port}/openapi.json\n`);

  try {
    await app.listen({ hostname, port });
  } catch (error) {
    console.error(`❌ Failed to start server: ${error}`);
    Deno.exit(1);
  }
}

// Run main
main().catch((error) => {
  console.error(`❌ Fatal error: ${error}`);
  Deno.exit(1);
});
