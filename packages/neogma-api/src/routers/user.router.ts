import { Router } from "oak";
import { z } from "zod";
import { User, UserSchema } from "../models/User.ts";

export const userRouter = new Router();

// Helper function to get user data from Neogma instance
// Neogma instances can have properties in different locations depending on the query result
const getUserData = (user: any) => {
  // Try to get properties from common Neogma locations
  const props = user?.properties || user?.dataValues || user;
  
  return {
    id: props.id,
    name: props.name,
    email: props.email,
    createdAt: props.createdAt,
  };
};

// Create a new user - POST /api/users
userRouter.post("/api/users", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    
    // Validate input
    const inputSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    });
    const input = inputSchema.parse(body);

    const user = await User.createOne(
      {
        id: crypto.randomUUID(),
        name: input.name,
        email: input.email,
        createdAt: new Date().toISOString(),
      },
      {
        validate: true,
      }
    );

    ctx.response.status = 201;
    ctx.response.body = getUserData(user);
  } catch (error) {
    ctx.response.status = 400;
    ctx.response.body = { error: error.message };
  }
});

// Get user by ID - GET /api/users/:id
userRouter.get("/api/users/:id", async (ctx) => {
  try {
    const id = ctx.params.id;

    // Validate UUID
    z.string().uuid().parse(id);

    const user = await User.findOne({
      where: { id },
    });

    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: "User not found" };
      return;
    }

    ctx.response.body = getUserData(user);
  } catch (error) {
    ctx.response.status = 400;
    ctx.response.body = { error: error.message };
  }
});

// List all users - GET /api/users
userRouter.get("/api/users", async (ctx) => {
  try {
    const url = new URL(ctx.request.url);
    const limit = Number(url.searchParams.get("limit")) || 10;
    const offset = Number(url.searchParams.get("offset")) || 0;

    // Validate query params
    z.number().min(1).max(100).parse(limit);
    z.number().min(0).parse(offset);

    const users = await User.findMany({
      limit,
      skip: offset,
    });

    // Map users and filter out any that are missing required fields
    const validUsers = users
      .map((user: any) => {
        const data = getUserData(user);
        return data;
      })
      .filter((user: any) => user.id && user.name && user.email && user.createdAt);

    ctx.response.body = validUsers;
  } catch (error) {
    console.error('Error in list users:', error);
    ctx.response.status = 400;
    ctx.response.body = { error: error.message };
  }
});

// Update user - PUT /api/users/:id
userRouter.put("/api/users/:id", async (ctx) => {
  try {
    const id = ctx.params.id;
    const body = await ctx.request.body().value;

    // Validate UUID
    z.string().uuid().parse(id);

    // Validate update data
    const updateSchema = z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
    });
    const updateData = updateSchema.parse(body);

    const user = await User.update(
      { id },
      updateData,
      { return: true }
    );

    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: "User not found" };
      return;
    }

    ctx.response.body = getUserData(user);
  } catch (error) {
    ctx.response.status = 400;
    ctx.response.body = { error: error.message };
  }
});

// Delete user - DELETE /api/users/:id
userRouter.delete("/api/users/:id", async (ctx) => {
  try {
    const id = ctx.params.id;

    // Validate UUID
    z.string().uuid().parse(id);

    await User.delete({ where: { id } });

    ctx.response.status = 200;
    ctx.response.body = { success: true };
  } catch (error) {
    ctx.response.status = 400;
    ctx.response.body = { error: error.message };
  }
});
