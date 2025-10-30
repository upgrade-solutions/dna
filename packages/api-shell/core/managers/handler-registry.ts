// Handler registry for dynamically managing handler functions

import { ExecutionContext, HandlerConfig, HandlerFunction } from "../types.ts";

export class HandlerRegistry {
  private handlers: Map<string, HandlerFunction> = new Map();

  register(name: string, handler: HandlerFunction): void {
    this.handlers.set(name, handler);
  }

  get(name: string): HandlerFunction | undefined {
    return this.handlers.get(name);
  }

  has(name: string): boolean {
    return this.handlers.has(name);
  }

  async execute(
    handlerType: string,
    ctx: ExecutionContext,
    config: HandlerConfig
  ): Promise<unknown> {
    const handler = this.get(handlerType);
    if (!handler) {
      throw new Error(`Handler type '${handlerType}' not registered`);
    }
    return handler(ctx, config);
  }

  listHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export function createHandlerRegistry(): HandlerRegistry {
  return new HandlerRegistry();
}
