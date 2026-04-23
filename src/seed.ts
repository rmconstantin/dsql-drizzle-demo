/**
 * Seed the database with sample products.
 *
 * Usage:
 *   CLUSTER_ENDPOINT=abc123.dsql.us-east-1.on.aws tsx src/seed.ts
 */

import { createDb } from "./db/connection.js";
import { products } from "./db/schema.js";

const sampleProducts = [
  {
    name: "Mechanical Keyboard",
    category: "electronics",
    price: 12999, // $129.99
    tags: "electronics,peripherals,gaming",
    metadata: JSON.stringify({ brand: "KeyCo", switches: "Cherry MX Blue" }),
  },
  {
    name: "Ergonomic Mouse",
    category: "electronics",
    price: 7999,
    tags: "electronics,peripherals,ergonomic",
    metadata: JSON.stringify({ brand: "ErgoTech", dpi: 16000 }),
  },
  {
    name: "USB-C Hub",
    category: "accessories",
    price: 4999,
    tags: "accessories,usb,hub",
    metadata: JSON.stringify({ ports: 7, brand: "HubMax" }),
  },
];

async function main() {
  const { db, pool } = createDb();

  console.log("Seeding products...");
  const inserted = await db.insert(products).values(sampleProducts).returning();
  console.log(`Inserted ${inserted.length} products:`);
  for (const p of inserted) {
    console.log(`  - ${p.name} ($${(p.price / 100).toFixed(2)}) [${p.id}]`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
