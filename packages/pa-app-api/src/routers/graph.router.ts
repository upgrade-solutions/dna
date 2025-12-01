import { Router } from "oak";
import { GraphNode } from "../models/GraphNode.ts";
import { neogma } from "../db.ts";

const graphRouter = new Router();

interface Neo4jNode {
  id: number;
  properties: Record<string, unknown>;
}

interface Neo4jRelationship {
  id: number;
  startNode: string;
  endNode: string;
  properties?: Record<string, unknown>;
}

interface JointJSCell {
  type: string;
  id: string;
  [key: string]: unknown;
}

/**
 * Transform Neo4j graph data to JointJS format
 */
function transformToJointJSFormat(nodes: Neo4jNode[], relationships: Neo4jRelationship[]) {
  const cells: JointJSCell[] = [];
  let zIndex = 1;

  // Transform nodes to JointJS cells
  nodes.forEach((node) => {
    const props = node.properties;
    // Convert Neo4j Integer objects to regular numbers
    const width = typeof props.width === 'object' && 'toNumber' in props.width 
      ? (props.width as { toNumber: () => number }).toNumber() 
      : Number(props.width) || 250;
    const height = typeof props.height === 'object' && 'toNumber' in props.height
      ? (props.height as { toNumber: () => number }).toNumber()
      : Number(props.height) || 80;
    const x = typeof props.x === 'object' && 'toNumber' in props.x
      ? (props.x as { toNumber: () => number }).toNumber()
      : Number(props.x) || 0;
    const y = typeof props.y === 'object' && 'toNumber' in props.y
      ? (props.y as { toNumber: () => number }).toNumber()
      : Number(props.y) || 0;

    cells.push({
      type: String(props.type) || "app.Message",
      size: {
        width,
        height,
      },
      position: {
        x,
        y,
      },
      id: String(props.id),
      z: zIndex++,
      attrs: {
        label: { text: String(props.label) || "Node" },
        description: { text: String(props.description || "") },
        ...(props.icon && { icon: { xlinkHref: String(props.icon) } }),
      },
      ports: {
        items: [
          { group: "left", id: `${props.id}-in` },
          { group: "right", id: `${props.id}-out` },
        ],
      },
    });
  });

  // Transform relationships to JointJS links
  relationships.forEach((rel) => {
    cells.push({
      type: "app.Link",
      id: `link-${rel.id}`,
      z: zIndex++,
      source: {
        id: String(rel.startNode),
        magnet: "portBody",
        port: `${rel.startNode}-out`,
      },
      target: {
        id: String(rel.endNode),
        magnet: "portBody",
        port: `${rel.endNode}-in`,
      },
      labels: [
        {
          attrs: {
            labelText: {
              text: String(rel.properties?.linkLabel || ""),
            },
          },
          position: { distance: 0.5 },
        },
      ],
      attrs: {},
    });
  });

  return { cells };
}

// GET /api/graph - Get current graph data from Neo4j
graphRouter.get("/api/graph", async (ctx) => {
  try {
    // Fetch all graph nodes
    const nodesResult = await neogma.queryRunner.run(`
      MATCH (n:GraphNode)
      RETURN collect({id: id(n), properties: properties(n)}) as nodes
    `);

    const nodes = nodesResult.records.length > 0 
      ? nodesResult.records[0].get("nodes").filter((n: Neo4jNode) => n.properties.id) as Neo4jNode[]
      : [];

    // Fetch all relationships separately
    const relsResult = await neogma.queryRunner.run(`
      MATCH (n:GraphNode)-[r:CONNECTS_TO]->(m:GraphNode)
      RETURN collect({
        id: id(r), 
        startNode: n.id, 
        endNode: m.id, 
        properties: properties(r)
      }) as relationships
    `);

    const relationships = relsResult.records.length > 0
      ? relsResult.records[0].get("relationships").filter((r: Neo4jRelationship) => r.startNode && r.endNode) as Neo4jRelationship[]
      : [];

    const graphData = transformToJointJSFormat(nodes, relationships);
    ctx.response.body = graphData;
  } catch (error) {
    console.error("Error fetching graph data:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      error: "Failed to fetch graph data",
      cells: [] 
    };
  }
});

// POST /api/graph - Save graph data to Neo4j
graphRouter.post("/api/graph", async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "json" }).value;

    if (!body || !body.cells || !Array.isArray(body.cells)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid graph data format" };
      return;
    }

    // Clear existing graph
    await neogma.queryRunner.run(`
      MATCH (n:GraphNode)
      DETACH DELETE n
    `);

    // Save nodes
    const nodeCreationPromises = body.cells
      .filter((cell: JointJSCell) => cell.type !== "app.Link" && !cell.source)
      .map((cell: JointJSCell) => {
        return GraphNode.createOne({
          id: cell.id,
          type: cell.type,
          label: cell.attrs?.label?.text || "Node",
          description: cell.attrs?.description?.text || "",
          x: cell.position?.x || 0,
          y: cell.position?.y || 0,
          width: cell.size?.width || 250,
          height: cell.size?.height || 80,
          icon: cell.attrs?.icon?.xlinkHref,
          createdAt: new Date().toISOString(),
        });
      });

    await Promise.all(nodeCreationPromises);

    // Save relationships
    const links = body.cells.filter((cell: JointJSCell) => cell.type === "app.Link" || cell.source);
    for (const link of links) {
      if (link.source?.id && link.target?.id) {
        const sourceNode = await GraphNode.findOne({ where: { id: link.source.id } });
        if (sourceNode) {
          await sourceNode.relateTo({
            alias: "connectsTo",
            where: { id: link.target.id },
            properties: {
              linkLabel: link.labels?.[0]?.attrs?.labelText?.text || "",
              createdAt: new Date().toISOString(),
            },
          });
        }
      }
    }

    ctx.response.body = { 
      success: true, 
      message: "Graph data saved successfully to Neo4j" 
    };
  } catch (error) {
    console.error("Error saving graph data:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to save graph data" };
  }
});

// POST /api/graph/seed - Seed sample graph data
graphRouter.post("/api/graph/seed", async (ctx) => {
  try {
    const { seedGraphData } = await import("./seed-graph.ts");
    await seedGraphData();
    ctx.response.body = { 
      success: true, 
      message: "Graph data seeded successfully" 
    };
  } catch (error) {
    console.error("Error seeding graph data:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to seed graph data" };
  }
});

export { graphRouter };
