import { GraphNode } from "../models/GraphNode.ts";
import { neogma } from "../db.ts";

/**
 * Seed the database with sample graph nodes and relationships
 */
export async function seedGraphData() {
  console.log("🌱 Seeding graph data...");

  try {
    // Clear existing graph nodes
    await neogma.queryRunner.run(`
      MATCH (n:GraphNode)
      DETACH DELETE n
    `);

    // Create sample nodes with Cypher directly
    await neogma.queryRunner.run(`
      CREATE (n1:GraphNode {
        id: "api-node-1",
        type: "app.Message",
        label: "API Publisher",
        description: "Live data from Neo4j",
        x: 50,
        y: 100,
        width: 250,
        height: 80,
        createdAt: datetime()
      })
      CREATE (n2:GraphNode {
        id: "api-node-2",
        type: "app.Message",
        label: "Content Store",
        description: "Neo4j backed node",
        x: 500,
        y: 100,
        width: 250,
        height: 80,
        createdAt: datetime()
      })
      CREATE (n3:GraphNode {
        id: "api-node-3",
        type: "app.Message",
        label: "Processing Engine",
        description: "Real-time from database",
        x: 950,
        y: 100,
        width: 250,
        height: 80,
        createdAt: datetime()
      })
      CREATE (n4:GraphNode {
        id: "api-node-4",
        type: "app.Message",
        label: "Distribution Hub",
        description: "Connected via Neo4j relationships",
        x: 1400,
        y: 100,
        width: 250,
        height: 80,
        createdAt: datetime()
      })
      CREATE (n1)-[:CONNECTS_TO {linkLabel: "Sends to", createdAt: datetime()}]->(n2)
      CREATE (n2)-[:CONNECTS_TO {linkLabel: "Processes", createdAt: datetime()}]->(n3)
      CREATE (n3)-[:CONNECTS_TO {linkLabel: "Distributes to", createdAt: datetime()}]->(n4)
    `);

    console.log("✅ Graph data seeded successfully");
    console.log(`   Created 4 nodes with 3 relationships`);
  } catch (error) {
    console.error("❌ Failed to seed graph data:", error);
    throw error;
  }
}
