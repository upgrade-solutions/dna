/**
 * Type definitions for the tRPC API router
 * This file should be kept in sync with the neogma-api router
 * 
 * To update these types, you can either:
 * 1. Manually sync with neogma-api/src/router.ts
 * 2. Generate them automatically using tRPC's type generation
 */

export type AppRouter = {
  health: {
    query: () => Promise<{ status: string; timestamp: string }>;
  };
  dbInfo: {
    query: () => Promise<any>;
  };
  createNode: {
    mutation: (input: {
      label: string;
      properties: Record<string, any>;
    }) => Promise<any>;
  };
  findNodes: {
    query: (input: { label: string; limit?: number }) => Promise<any[]>;
  };
  user: {
    getAll: {
      query: () => Promise<any[]>;
    };
    getById: {
      query: (input: { id: string }) => Promise<any>;
    };
    create: {
      mutation: (input: any) => Promise<any>;
    };
    update: {
      mutation: (input: any) => Promise<any>;
    };
    delete: {
      mutation: (input: { id: string }) => Promise<void>;
    };
  };
};
