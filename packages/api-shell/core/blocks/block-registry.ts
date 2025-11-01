// Block Registry
// Manages registration and retrieval of block definitions and handlers

import {
  BlockDefinition,
  BlockHandler,
  BlockRegistryEntry,
} from "../types.ts";


/**
 * Block Registry
 * Central repository for all available blocks
 */
export class BlockRegistry {
  private blocks: Map<string, BlockRegistryEntry> = new Map();

  /**
   * Register a block with its handler
   */
  register(
    blockId: string,
    definition: BlockDefinition,
    handler: BlockHandler
  ): void {
    if (this.blocks.has(blockId)) {
      console.warn(`Block '${blockId}' is already registered, overwriting`);
    }

    this.blocks.set(blockId, {
      definition,
      handler,
    });
  }

  /**
   * Get a block definition
   */
  getDefinition(blockId: string): BlockDefinition | undefined {
    return this.blocks.get(blockId)?.definition;
  }

  /**
   * Get a block handler
   */
  getHandler(blockId: string): BlockHandler | undefined {
    return this.blocks.get(blockId)?.handler;
  }

  /**
   * Check if a block is registered
   */
  has(blockId: string): boolean {
    return this.blocks.has(blockId);
  }

  /**
   * List all registered block IDs
   */
  listBlocks(): string[] {
    return Array.from(this.blocks.keys());
  }

  /**
   * List all registered block types
   */
  listBlockTypes(): string[] {
    const types = new Set<string>();
    for (const entry of this.blocks.values()) {
      types.add(entry.definition.type);
    }
    return Array.from(types);
  }

  /**
   * Get all blocks of a specific type
   */
  getByType(type: string): Map<string, BlockRegistryEntry> {
    const result = new Map<string, BlockRegistryEntry>();
    for (const [id, entry] of this.blocks.entries()) {
      if (entry.definition.type === type) {
        result.set(id, entry);
      }
    }
    return result;
  }
}

/**
 * Create a new block registry
 */
export function createBlockRegistry(): BlockRegistry {
  return new BlockRegistry();
}
