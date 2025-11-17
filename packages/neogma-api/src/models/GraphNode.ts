import { z } from "zod";
import { 
  ModelFactory, 
  ModelRelatedNodesI
} from "neogma";
import { neogma } from "../db.ts";

// Zod schema for GraphNode validation
export const GraphNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  description: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().default(250),
  height: z.number().default(80),
  icon: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type GraphNodeType = z.infer<typeof GraphNodeSchema>;

// Neogma model properties
export interface GraphNodeProps {
  [key: string]: string | number | undefined;
  id: string;
  type: string;
  label: string;
  description?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  icon?: string;
  createdAt: string;
}

// Define relationships
export interface GraphNodeRelations {
  connectsTo: ModelRelatedNodesI<typeof GraphNode, GraphNodeProps, GraphLinkProps>;
}

// Link properties for relationships
export interface GraphLinkProps {
  linkLabel?: string;
  createdAt: string;
}

// Create Neogma model
export const GraphNode = ModelFactory<GraphNodeProps, GraphNodeRelations>(
  {
    label: "GraphNode",
    schema: {
      id: {
        type: "string",
        required: true,
      },
      type: {
        type: "string",
        required: true,
      },
      label: {
        type: "string",
        required: true,
      },
      description: {
        type: "string",
        required: false,
      },
      x: {
        type: "number",
        required: true,
      },
      y: {
        type: "number",
        required: true,
      },
      width: {
        type: "number",
        required: false,
      },
      height: {
        type: "number",
        required: false,
      },
      icon: {
        type: "string",
        required: false,
      },
      createdAt: {
        type: "string",
        required: true,
      },
    },
    primaryKeyField: "id",
    relationships: {
      connectsTo: {
        model: "GraphNode",
        direction: "out",
        name: "CONNECTS_TO",
        properties: {
          linkLabel: {
            property: "linkLabel",
            schema: {
              type: "string",
              required: false,
            },
          },
          createdAt: {
            property: "createdAt",
            schema: {
              type: "string",
              required: true,
            },
          },
        },
      },
    },
  },
  neogma
);
