// Block Execution Engine
// Orchestrates execution of block chains with data flow management

import {
  BlockChain,
  BlockInstance,
  BlockExecutionContext,
  BlockExecutionResult,
  BlockChainExecutionResult,
  ExecutionContext,
  extractValue,
} from "../types.ts";
import { BlockRegistry } from "./block-registry.ts";

/**
 * Block Execution Engine
 * Handles execution of block chains with:
 * - Sequential and parallel execution
 * - Data flow between blocks
 * - Error handling and retries
 * - Timeout management
 */
export class BlockExecutionEngine {
  constructor(private registry: BlockRegistry) {}

  /**
   * Execute a complete block chain
   */
  async executeChain(
    chain: BlockChain,
    ctx: ExecutionContext
  ): Promise<BlockChainExecutionResult> {
    const startTime = Date.now();
    const results: BlockExecutionResult[] = [];
    const blockOutputs: Record<string, Record<string, unknown>> = {};
    let hasError = false;
    let lastError: Error | undefined;

    try {
      // Separate sequential and parallel blocks
      const sequential: BlockInstance[] = [];
      const parallelBatches: BlockInstance[][] = [];
      let currentBatch: BlockInstance[] = [];

      for (const block of chain.blocks) {
        if (block.parallel) {
          currentBatch.push(block);
        } else {
          if (currentBatch.length > 0) {
            parallelBatches.push(currentBatch);
            currentBatch = [];
          }
          sequential.push(block);
        }
      }
      if (currentBatch.length > 0) {
        parallelBatches.push(currentBatch);
      }

      // Execute sequential blocks
      for (let i = 0; i < sequential.length; i++) {
        const block = sequential[i];

        const blockCtx = this.createBlockContext(
          block,
          ctx,
          blockOutputs,
          i,
          chain.blocks.length
        );

        try {
          const result = await this.executeBlock(block, blockCtx);
          results.push(result);
          blockOutputs[block.id] = result.outputs;

          // Check for timeout
          if (
            chain.timeout &&
            Date.now() - startTime > chain.timeout
          ) {
            throw new Error(`Block chain timeout exceeded`);
          }
        } catch (error) {
          const result = this.handleBlockError(
            block,
            error,
            i,
            chain.blocks.length
          );
          results.push(result);

          if (
            chain.errorHandling?.strategy === "fail-fast" ||
            block.errorHandler === "fail"
          ) {
            hasError = true;
            lastError = error instanceof Error ? error : new Error(String(error));
            break;
          } else {
            // Always mark as error even if not fail-fast
            hasError = true;
            lastError = error instanceof Error ? error : new Error(String(error));
          }
        }
      }

      // Execute parallel batches (if no error in fail-fast mode)
      if (!hasError) {
        let batchIndex = sequential.length;

        for (const batch of parallelBatches) {
          const batchPromises = batch.map((block, index) => {
            const blockCtx = this.createBlockContext(
              block,
              ctx,
              blockOutputs,
              batchIndex + index,
              chain.blocks.length
            );
            return this.executeBlock(block, blockCtx).catch((error) =>
              this.handleBlockError(
                block,
                error,
                batchIndex + index,
                chain.blocks.length
              )
            );
          });

          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);

          // Store outputs from parallel blocks
          for (const result of batchResults) {
            blockOutputs[result.blockId] = result.outputs;

            if (!result.success) {
              const correspondingBlock = batch.find(
                (b) => b.id === result.blockId
              );
              if (correspondingBlock?.errorHandler === "fail") {
                hasError = true;
                lastError = result.error;
                break;
              }
            }
          }

          batchIndex += batch.length;

          if (
            chain.timeout &&
            Date.now() - startTime > chain.timeout
          ) {
            throw new Error(`Block chain timeout exceeded`);
          }

          if (
            hasError &&
            chain.errorHandling?.strategy === "fail-fast"
          ) {
            break;
          }
        }
      }

      // Aggregate final outputs
      const finalOutputs = this.aggregateOutputs(blockOutputs, chain.blocks);

      return {
        chainId: chain.id,
        success: !hasError && !lastError,
        results,
        outputs: finalOutputs,
        error: lastError,
        totalDuration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        chainId: chain.id,
        success: false,
        results,
        outputs: {},
        error: err,
        totalDuration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Execute a single block
   */
  private async executeBlock(
    blockInstance: BlockInstance,
    ctx: BlockExecutionContext
  ): Promise<BlockExecutionResult> {
    const startTime = Date.now();

    try {
      // Get block handler from registry
      const blockDef = this.registry.getDefinition(blockInstance.blockType);
      const handler = this.registry.getHandler(blockInstance.blockType);

      if (!blockDef || !handler) {
        throw new Error(
          `Block type '${blockInstance.blockType}' not registered`
        );
      }

      // Apply timeout if specified
      const executePromise = handler(ctx, blockInstance.config);
      let outputs: Record<string, unknown>;

      if (blockInstance.timeout) {
        outputs = await this.withTimeout(
          executePromise,
          blockInstance.timeout
        );
      } else if (blockDef.timeout) {
        outputs = await this.withTimeout(
          executePromise,
          blockDef.timeout
        );
      } else {
        outputs = await executePromise;
      }

      return {
        blockId: blockInstance.id,
        blockType: blockInstance.blockType,
        success: true,
        outputs,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle block error with retry and fallback logic
   */
  private handleBlockError(
    block: BlockInstance,
    error: unknown,
    _index: number,
    _total: number
  ): BlockExecutionResult {
    const err = error instanceof Error ? error : new Error(String(error));

    let fallbackOutputs: Record<string, unknown> = {};

    if (block.fallback) {
      fallbackOutputs = { result: block.fallback };
    }

    return {
      blockId: block.id,
      blockType: block.blockType,
      success: false,
      outputs: fallbackOutputs,
      error: err,
      duration: 0,
      timestamp: new Date(),
    };
  }

  /**
   * Create execution context for a block
   */
  private createBlockContext(
    blockInstance: BlockInstance,
    ctx: ExecutionContext,
    blockOutputs: Record<string, Record<string, unknown>>,
    blockIndex: number,
    totalBlocks: number
  ): BlockExecutionContext {
    return {
      inputs: this.resolveInputs(blockInstance.inputs, blockOutputs, ctx),
      env: ctx.env,
      user: ctx.user,
      params: ctx.params,
      requestBody: ctx.body,
      blockOutputs,
      blockId: blockInstance.id,
      blockType: blockInstance.blockType,
      chainId: "",
      currentBlockIndex: blockIndex,
      totalBlocks,
      executedAt: new Date(),
    };
  }

  /**
   * Resolve input values with template substitution
   */
  private resolveInputs(
    inputs: Record<string, unknown>,
    blockOutputs: Record<string, Record<string, unknown>>,
    ctx: ExecutionContext
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(inputs)) {
      resolved[key] = this.resolveValue(value, blockOutputs, ctx);
    }

    return resolved;
  }

  /**
   * Resolve a single value with template substitution
   * Supports: ${blocks.blockId.outputName}, ${params.name}, ${env.NAME}
   */
  private resolveValue(
    value: unknown,
    blockOutputs: Record<string, Record<string, unknown>>,
    ctx: ExecutionContext
  ): unknown {
    if (typeof value !== "string") {
      if (typeof value === "object" && value !== null) {
        // Recursively resolve nested objects
        return Object.entries(value as Record<string, unknown>).reduce(
          (acc, [k, v]) => {
            (acc as Record<string, unknown>)[k] = this.resolveValue(
              v,
              blockOutputs,
              ctx
            );
            return acc;
          },
          {} as Record<string, unknown>
        );
      }
      return value;
    }

    // Check for template patterns
    const blockMatch = value.match(/\$\{blocks\.(\w+)\.(\w+)\}/);
    if (blockMatch) {
      const [, blockId, outputName] = blockMatch;
      return blockOutputs[blockId]?.[outputName];
    }

    const paramMatch = value.match(/\$\{params\.(\w+)\}/);
    if (paramMatch) {
      const [, paramName] = paramMatch;
      return ctx.params[paramName];
    }

    const envMatch = value.match(/\$\{env\.(\w+)\}/);
    if (envMatch) {
      const [, envName] = envMatch;
      return ctx.env[envName];
    }

    const bodyMatch = value.match(/\$\{body\.(.+)\}/);
    if (bodyMatch) {
      const [, path] = bodyMatch;
      return extractValue(ctx.body as Record<string, unknown>, path);
    }

    return value;
  }

  /**
   * Aggregate outputs from all blocks
   */
  private aggregateOutputs(
    blockOutputs: Record<string, Record<string, unknown>>,
    blocks: BlockInstance[]
  ): Record<string, unknown> {
    const aggregated: Record<string, unknown> = {
      blocks: {},
    };

    for (const block of blocks) {
      (aggregated.blocks as Record<string, unknown>)[block.id] =
        blockOutputs[block.id] || {};
    }

    return aggregated;
  }

  /**
   * Execute promise with timeout
   */
  private withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error(`Block execution timeout after ${timeoutMs}ms`)),
        timeoutMs
      );
    });

    return Promise.race([promise, timeoutPromise])
      .then(
        (result) => {
          if (timeoutId) clearTimeout(timeoutId);
          return result;
        },
        (error) => {
          if (timeoutId) clearTimeout(timeoutId);
          throw error;
        }
      );
  }
}

/**
 * Create a new block execution engine
 */
export function createBlockExecutionEngine(
  registry: BlockRegistry
): BlockExecutionEngine {
  return new BlockExecutionEngine(registry);
}
