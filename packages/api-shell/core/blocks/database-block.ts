// Database Block
// Composable block for database operations (select, insert, update, delete)

import {
  BlockDefinition,
  BlockHandler,
  BlockExecutionContext,
} from "../types.ts";

/**
 * Database Block Definition
 */
export const databaseBlockDefinition: BlockDefinition = {
  id: "database",
  type: "database",
  description: "Execute database operations (select, insert, update, delete)",
  config: {
    provider: "postgres", // postgres, mysql, sqlite, mongodb
    connectionString: "", // Typically from env
  },
  inputs: [
    {
      name: "function",
      type: "string",
      required: true,
      description: "Database operation: select, insert, update, delete, query",
    },
    {
      name: "table",
      type: "string",
      description: "Table name (for select, insert, update, delete)",
    },
    {
      name: "data",
      type: "object",
      description: "Data to insert or update",
    },
    {
      name: "where",
      type: "object",
      description: "Query conditions",
    },
    {
      name: "limit",
      type: "number",
      default: 100,
      description: "Result limit",
    },
    {
      name: "query",
      type: "string",
      description: "Raw SQL query (for query function)",
    },
    {
      name: "params",
      type: "array",
      description: "Query parameters for parameterized queries",
    },
  ],
  outputs: [
    {
      name: "rows",
      type: "array",
      description: "Query results",
    },
    {
      name: "count",
      type: "number",
      description: "Number of affected rows or result count",
    },
    {
      name: "id",
      type: "string",
      description: "ID of inserted row",
    },
    {
      name: "success",
      type: "boolean",
      description: "Operation success",
    },
  ],
  functions: ["select", "insert", "update", "delete", "query"],
};

/**
 * Database Block Handler
 * In production, this would connect to actual database
 */
export const databaseBlockHandler: BlockHandler = (
  ctx: BlockExecutionContext,
  config: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  const { data, where, limit = 100, params: _params } =
    ctx.inputs as Record<string, unknown>;

  // Get function, table, and query from config
  const func = config.function;
  const table = config.table;
  const query = config.query;

  // Validate inputs
  if (!func) {
    return Promise.reject(new Error("Database block requires 'function' input"));
  }

  const funcStr = String(func);

  switch (funcStr) {
    case "select": {
      if (!table) {
        return Promise.reject(new Error("Select requires 'table' input"));
      }

      // Mock select operation
      // In production, this would execute actual query
      const whereObj =
        typeof where === "object" && where !== null ? (where as Record<string, unknown>) : {};
      const mockRows = [
        {
          id: "mock-1",
          ...whereObj,
          created_at: new Date().toISOString(),
        },
      ];

      return Promise.resolve({
        rows: mockRows.slice(0, limit as number),
        count: mockRows.length,
        success: true,
      });
    }

    case "insert": {
      if (!table) {
        return Promise.reject(new Error("Insert requires 'table' input"));
      }
      if (!data) {
        return Promise.reject(new Error("Insert requires 'data' input"));
      }

      // Mock insert operation
      const id = crypto.randomUUID();

      return Promise.resolve({
        id,
        success: true,
        count: 1,
      });
    }

    case "update": {
      if (!table) {
        return Promise.reject(new Error("Update requires 'table' input"));
      }
      if (!data) {
        return Promise.reject(new Error("Update requires 'data' input"));
      }
      if (!where) {
        return Promise.reject(new Error("Update requires 'where' input"));
      }

      // Mock update operation
      return Promise.resolve({
        success: true,
        count: 1,
      });
    }

    case "delete": {
      if (!table) {
        return Promise.reject(new Error("Delete requires 'table' input"));
      }
      if (!where) {
        return Promise.reject(new Error("Delete requires 'where' input"));
      }

      // Mock delete operation
      return Promise.resolve({
        success: true,
        count: 1,
      });
    }

    case "query": {
      if (!query) {
        return Promise.reject(new Error("Query requires 'query' input"));
      }

      // Mock raw query execution
      const mockRows = [{ result: "mock-result" }];

      return Promise.resolve({
        rows: mockRows,
        count: mockRows.length,
        success: true,
      });
    }

    default:
      return Promise.reject(new Error(`Unknown database function: ${funcStr}`));
  }
};

/**
 * Register database block
 */
export function registerDatabaseBlock(registry: {
  register: (id: string, def: BlockDefinition, handler: BlockHandler) => void;
}): void {
  registry.register(
    "database",
    databaseBlockDefinition,
    databaseBlockHandler
  );
}
