// Schema serving endpoint for DNA framework
// Provides access to canonical JSON schemas via REST API

import { Router } from "oak";
import { join } from "std/path/mod.ts";

const schemasBaseDir = "../core/schemas";

/**
 * Creates a router for serving DNA schemas
 * 
 * Routes:
 * - GET /api/schemas - Lists all available schemas
 * - GET /api/schemas/{category}/{name} - Gets a specific schema
 * - GET /api/schemas/{name} - Gets a schema from root or finds it recursively
 */
export function createSchemasRouter(): Router {
  const router = new Router();

  /**
   * List all available schemas
   */
  router.get("/api/schemas", async (ctx) => {
    try {
      const schemas = await listSchemasRecursive(schemasBaseDir);
      ctx.response.body = {
        count: schemas.length,
        schemas,
      };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = { error: `Failed to list schemas: ${error.message}` };
    }
  });

  /**
   * Get a specific schema by path
   * GET /api/schemas/core/actor
   * GET /api/schemas/actor
   */
  router.get("/api/schemas/:path+", async (ctx) => {
    try {
      const { path: pathParam } = ctx.params;
      
      // Remove trailing .json if provided
      const schemaName = pathParam.replace(/\.json$/, "");
      
      // Try multiple path patterns
      const possiblePaths = [
        `${schemasBaseDir}/${schemaName}.json`,
        `${schemasBaseDir}/${schemaName}/index.json`,
      ];

      let schemaContent: string | null = null;

      for (const filePath of possiblePaths) {
        try {
          const absolutePath = await Deno.realPath(filePath).catch(() => null);
          if (
            absolutePath &&
            absolutePath.startsWith(await Deno.realPath(schemasBaseDir))
          ) {
            schemaContent = await Deno.readTextFile(filePath);
            break;
          }
        } catch {
          // Continue to next path
        }
      }

      if (!schemaContent) {
        ctx.response.status = 404;
        ctx.response.body = {
          error: `Schema not found: ${schemaName}`,
          hint: `Try GET /api/schemas to see available schemas`,
        };
        return;
      }

      ctx.response.headers.set("Content-Type", "application/json");
      ctx.response.body = JSON.parse(schemaContent);
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = { error: `Failed to load schema: ${error.message}` };
    }
  });

  return router;
}

/**
 * Recursively list all schema files
 */
async function listSchemasRecursive(
  dir: string,
  prefix = ""
): Promise<{ name: string; path: string }[]> {
  const schemas: { name: string; path: string }[] = [];

  try {
    for await (const entry of Deno.readDir(dir)) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory) {
        const subSchemas = await listSchemasRecursive(
          fullPath,
          prefix ? `${prefix}/${entry.name}` : entry.name
        );
        schemas.push(...subSchemas);
      } else if (entry.name.endsWith(".json")) {
        const name = entry.name.replace(".json", "");
        const path = prefix ? `${prefix}/${name}` : name;
        schemas.push({ name, path });
      }
    }
  } catch (error) {
    console.error(`Error reading schemas directory: ${error.message}`);
  }

  return schemas.sort((a, b) => a.path.localeCompare(b.path));
}
