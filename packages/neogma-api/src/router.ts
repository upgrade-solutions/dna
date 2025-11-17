import { z } from "zod";
import { router, publicProcedure } from "./trpc.ts";
import { userRouter } from "./routers/user.router.ts";

export const appRouter = router({
  // Health check endpoint
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),

  // Example query to get database info
  dbInfo: publicProcedure.query(async ({ ctx }: any) => {
    const result = await ctx.neogma.queryRunner.run(
      "CALL dbms.components() YIELD name, versions, edition"
    );
    return result.records[0]?.toObject();
  }),

  // Example mutation to create a node
  createNode: publicProcedure
    .input(
      z.object({
        label: z.string(),
        properties: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      const result = await ctx.neogma.queryRunner.run(
        `CREATE (n:${input.label} $properties) RETURN n`,
        { properties: input.properties }
      );
      return result.records[0]?.get("n").properties;
    }),

  // Example query to find nodes
  findNodes: publicProcedure
    .input(
      z.object({
        label: z.string(),
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ ctx, input }: any) => {
      const result = await ctx.neogma.queryRunner.run(
        `MATCH (n:${input.label}) RETURN n LIMIT $limit`,
        { limit: input.limit }
      );
      return result.records.map((record: any) => record.get("n").properties);
    }),

  // User routes
  user: userRouter,
});

export type AppRouter = typeof appRouter;
