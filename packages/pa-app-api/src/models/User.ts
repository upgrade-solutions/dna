import { z } from "zod";
import { 
  ModelFactory, 
  ModelRelatedNodesI, 
  NeogmaInstance 
} from "neogma";
import { neogma } from "../db.ts";

// Zod schema for User validation
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  createdAt: z.string().datetime(),
});

export type UserType = z.infer<typeof UserSchema>;

// Neogma model properties
export interface UserProps {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Define relationships if needed
export interface UserRelations {
  // Example: friends: ModelRelatedNodesI<typeof User, UserProps>;
}

// Create Neogma model
export const User = ModelFactory<UserProps, UserRelations>(
  {
    label: "User",
    schema: {
      id: {
        type: "string",
        required: true,
      },
      name: {
        type: "string",
        required: true,
      },
      email: {
        type: "string",
        required: true,
      },
      createdAt: {
        type: "string",
        required: true,
      },
    },
    primaryKeyField: "id",
  },
  neogma
);
