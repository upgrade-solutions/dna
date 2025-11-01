// Blocks Handler
// Integrates block chains into the handler system

import {
  ExecutionContext,
  HandlerConfig,
  BlocksHandlerConfig,
  BlockChain,
  BlockInstance,
  extractValue,
} from "../types.ts";
import { BlockExecutionEngine } from "../blocks/block-execution-engine.ts";
import { BlockRegistry as _BlockRegistry } from "../blocks/block-registry.ts";

/**
 * Handle block chain execution
 * This handler is called when x-handler.type = "blocks"
 */
export async function handleBlocks(
  ctx: ExecutionContext,
  config: HandlerConfig,
  engine: BlockExecutionEngine
): Promise<unknown> {
  const blocksConfig = config as BlocksHandlerConfig;

  // Get chain to execute
  let chain: BlockChain | undefined;

  if (blocksConfig.chainDefinition) {
    chain = blocksConfig.chainDefinition;
  } else if (blocksConfig.chain) {
    // In production, this would load from registry/OpenAPI spec
    throw new Error(
      `Block chain '${blocksConfig.chain}' not loaded. Use chainDefinition for inline chains.`
    );
  }

  if (!chain) {
    throw new Error("Blocks handler requires 'chain' or 'chainDefinition'");
  }

  // Execute the chain
  const result = await engine.executeChain(chain, ctx);

  if (!result.success) {
    throw result.error;
  }

  // Extract response based on responseKey
  if (blocksConfig.responseKey) {
    return extractValue(
      result.outputs as Record<string, unknown>,
      blocksConfig.responseKey
    );
  }

  // Default: return all block outputs
  return result.outputs;
}

/**
 * Factory function to create blocks handler with engine
 */
export function createBlocksHandler(engine: BlockExecutionEngine) {
  return (ctx: ExecutionContext, config: HandlerConfig) =>
    handleBlocks(ctx, config, engine);
}

/**
 * Load block definitions from OpenAPI spec and register them
 */
export function loadBlocksFromOpenAPI(
  spec: Record<string, unknown>,
  _registry: typeof _BlockRegistry
): Map<string, BlockChain> {
  const blocks = new Map<string, BlockChain>();

  // Check for x-blocks in components
  const components = spec.components as Record<string, unknown> | undefined;
  if (!components) {
    return blocks;
  }

  const xBlocks = components["x-blocks"] as
    | Record<string, Record<string, unknown>>
    | undefined;
  const xBlockChains = components["x-block-chains"] as
    | Record<string, BlockChain>
    | undefined;

  // Load block definitions into registry
  if (xBlocks) {
    for (const [id, _blockDef] of Object.entries(xBlocks)) {
      // Register blocks (but handlers would be registered separately)
      console.debug(`Loaded block definition: ${id}`);
    }
  }

  // Load block chains
  if (xBlockChains) {
    for (const [id, chain] of Object.entries(xBlockChains)) {
      blocks.set(id, chain);
    }
  }

  return blocks;
}

/**
 * Convert x-block-chain from OpenAPI operation to BlockChain
 */
export function convertBlockChainFromOpenAPI(
  blockChainConfig: unknown
): BlockChain | undefined {
  if (!blockChainConfig || typeof blockChainConfig !== "object") {
    return undefined;
  }

  const config = blockChainConfig as Record<string, unknown>;

  if (Array.isArray(config)) {
    // Convert array to BlockChain
    return {
      id: "inline-chain",
      blocks: config as BlockInstance[],
    };
  }

  // Handle object with blocks array
  if (config.blocks && Array.isArray(config.blocks)) {
    return {
      id: (config.id as string) || "unnamed-chain",
      blocks: config.blocks as BlockInstance[],
      timeout: config.timeout as number | undefined,
    };
  }

  return undefined;
}

