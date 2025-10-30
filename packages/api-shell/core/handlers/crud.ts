// CRUD handler for basic Create/Read/Update/Delete operations

import { ExecutionContext, HandlerConfig } from "../types.ts";

interface CrudConfig extends HandlerConfig {
  resource: string;
  operation: "create" | "read" | "update" | "delete";
  [key: string]: unknown;
}

/**
 * Handles CRUD operations
 * In a real implementation, this would connect to a database
 */
export async function handleCrud(
  ctx: ExecutionContext,
  config: CrudConfig
): Promise<unknown> {
  const { resource, operation } = config;

  // Simulated database operations
  switch (operation) {
    case "create": {
      const id = crypto.randomUUID();
      return {
        success: true,
        data: {
          id,
          ...ctx.body,
          created_at: new Date().toISOString(),
        },
        message: `${resource} created successfully`,
      };
    }

    case "read": {
      // In a real app, query database with params
      const id = ctx.params.id || ctx.body?.id;
      return {
        success: true,
        data: {
          id,
          // Mock data
          [resource]: "mock_data",
        },
      };
    }

    case "update": {
      const id = ctx.params.id || ctx.body?.id;
      return {
        success: true,
        data: {
          id,
          ...ctx.body,
          updated_at: new Date().toISOString(),
        },
        message: `${resource} updated successfully`,
      };
    }

    case "delete": {
      const id = ctx.params.id;
      return {
        success: true,
        message: `${resource} with id ${id} deleted successfully`,
      };
    }

    default:
      throw new Error(`Unknown CRUD operation: ${operation}`);
  }
}
