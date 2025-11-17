/**
 * Type-only exports for cross-package compatibility
 * This provides a minimal type stub for tRPC inference
 */

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// Define a minimal router type structure that matches our actual router
// This is a workaround to avoid importing Deno files into Node/React projects
type AppRouterDef = {
  _def: {
    _config: any;
    router: true;
    procedures: {
      health: any;
      dbInfo: any;
      createNode: any;
      findNodes: any;
      user: any;
    };
  };
  createCaller: any;
  getErrorShape: any;
};

export type AppRouter = AppRouterDef;

// For reference, these are the actual procedure types:
export type RouterInputs = {
  health: void;
  dbInfo: void;
  createNode: { label: string; properties: Record<string, any> };
  findNodes: { label: string; limit?: number };
  user: {
    create: { name: string; email: string };
    getById: { id: string };
    list: { limit?: number; offset?: number };
    update: { id: string; name?: string; email?: string };
    delete: { id: string };
  };
};

export type RouterOutputs = {
  health: { status: string; timestamp: string };
  dbInfo: any;
  createNode: any;
  findNodes: any[];
  user: {
    create: any;
    getById: any;
    list: any[];
    update: any;
    delete: { success: boolean };
  };
};
