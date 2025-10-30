// Script handler for executing TypeScript/JavaScript modules

import { ExecutionContext, HandlerConfig } from "../types.ts";

interface ScriptConfig extends HandlerConfig {
  file: string;
  timeout?: number;
  [key: string]: unknown;
}

/**
 * Executes TypeScript/JavaScript modules as handlers
 * Scripts should export a default function with signature:
 * export default async function(ctx: ExecutionContext): Promise<unknown>
 */
export async function handleScript(
  ctx: ExecutionContext,
  config: ScriptConfig
): Promise<unknown> {
  const { file, timeout = 30000 } = config;

  try {
    // In a real Deno app, dynamic imports would work directly
    // For now, we'll provide a simulated implementation
    const module = await import(file);
    const handler = module.default;

    if (typeof handler !== "function") {
      throw new Error(`Script ${file} must export a default function`);
    }

    // Execute with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const result = await handler(ctx);
      return result;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Script execution timeout (${timeout}ms)`);
    }
    throw new Error(
      `Failed to execute script ${file}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
