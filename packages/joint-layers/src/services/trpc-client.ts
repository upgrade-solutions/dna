import { createTRPCReact } from '@trpc/react-query';

// Create tRPC client - using 'any' for now to avoid cross-package type issues
// TODO: Set up proper type sharing between Deno and Node projects
export const trpc = createTRPCReact<any>();
