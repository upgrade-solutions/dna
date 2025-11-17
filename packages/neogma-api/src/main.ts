import { Application, Router } from "oak";
import { initDb } from "./db.ts";
import { userRouter } from "./routers/user.router.ts";
import { graphRouter } from "./routers/graph.router.ts";

// Initialize database connection
try {
  await initDb();
} catch (error) {
  Deno.exit(1);
}

const port = Number(Deno.env.get("PORT")) || 3000;

const app = new Application();
const router = new Router();

// CORS middleware
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
    return;
  }

  await next();
});

// Root endpoint
router.get("/", (ctx) => {
  ctx.response.body = {
    name: "Neogma API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      users: "/api/users",
      graph: "/api/graph",
      graphSeed: "/api/graph/seed (POST)",
    },
    docs: "See README.md for API documentation",
  };
});

// Health check
router.get("/api/health", (ctx) => {
  ctx.response.body = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
});

// Mount user routes
app.use(userRouter.routes());
app.use(userRouter.allowedMethods());

// Mount graph routes
app.use(graphRouter.routes());
app.use(graphRouter.allowedMethods());

// Mount main router
app.use(router.routes());
app.use(router.allowedMethods());

// Error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Error:", err);
    ctx.response.status = err.status || 500;
    ctx.response.body = {
      error: err.message || "Internal server error",
    };
  }
});

console.log(`🚀 Server running on http://localhost:${port}`);
await app.listen({ port });
