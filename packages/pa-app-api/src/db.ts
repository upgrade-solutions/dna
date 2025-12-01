import { Neogma } from "neogma";

const NEO4J_URL = Deno.env.get("NEO4J_URL") || "bolt://localhost:7687";
const NEO4J_USERNAME = Deno.env.get("NEO4J_USERNAME") || "neo4j";
const NEO4J_PASSWORD = Deno.env.get("NEO4J_PASSWORD") || "password";

export const neogma = new Neogma(
  {
    url: NEO4J_URL,
    username: NEO4J_USERNAME,
    password: NEO4J_PASSWORD,
  },
  {
    logger: console.log,
  }
);

// Test connection
export async function initDb() {
  console.log("🔌 Establishing Neo4j connection...");
  try {
    await neogma.verifyConnectivity();
    console.log("✅ Neo4j connected successfully");
    console.log(`   URL: ${NEO4J_URL}`);
    console.log(`   User: ${NEO4J_USERNAME}`);
  } catch (error) {
    console.error("❌ Failed to connect to Neo4j:", error);
    console.error("   Please check your Neo4j instance and credentials");
    throw error;
  }
}

