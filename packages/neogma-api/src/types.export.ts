/**
 * Type exports for consuming the neogma-api from other packages
 * This file uses Node-compatible imports for cross-package compatibility
 */

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// Re-export the AppRouter type from router
export type { AppRouter } from "./router.ts";

// Infer input and output types
export type RouterInputs = inferRouterInputs<import("./router.ts").AppRouter>;
export type RouterOutputs = inferRouterOutputs<import("./router.ts").AppRouter>;
