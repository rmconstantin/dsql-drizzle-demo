/**
 * Aurora DSQL + Drizzle ORM demo.
 *
 * Demonstrates:
 *  1. Connecting to DSQL via the official connector
 *  2. CRUD operations with Drizzle's query builder
 *  3. Application-layer referential integrity (no foreign keys in DSQL)
 *  4. Working with native JSON columns and serialized arrays stored as TEXT
 *
 * Usage:
 *   CLUSTER_ENDPOINT=abc123.dsql.us-east-1.on.aws tsx src/index.ts
 */

import { eq, like, sql } from "drizzle-orm";
import { createDb } from "./db/connection.js";
import { products, orders } from "./db/schema.js";

async function main() {
  const { db, pool } = createDb();

  try {
    // ── 1. Verify connection ──────────────────────────────────────────
    console.log("=== Aurora DSQL + Drizzle Demo ===\n");
    const versionResult = await db.execute(sql`SELECT version()`);
    const version = (versionResult.rows[0] as { version: string }).version;
    console.log(`Connected to: ${version}\n`);

    // ── 2. List products ──────────────────────────────────────────────
    console.log("--- Products ---");
    const allProducts = await db.select().from(products);

    if (allProducts.length === 0) {
      console.log("No products found. Run `tsx src/seed.ts` first.\n");
      await pool.end();
      return;
    }

    for (const p of allProducts) {
      const tags = p.tags?.split(",") ?? [];
      const meta = (p.metadata ?? {}) as Record<string, unknown>;
      console.log(
        `  ${p.name} — $${(p.price / 100).toFixed(2)} | tags: [${tags.join(", ")}] | brand: ${meta.brand ?? "n/a"}`
      );
    }
    console.log();

    // ── 3. Create an order (with app-layer referential integrity) ────
    console.log("--- Create Order ---");
    const targetProduct = allProducts[0];

    // Validate product exists before inserting order (no FK in DSQL)
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, targetProduct.id));

    if (!existing) {
      throw new Error(`Product ${targetProduct.id} not found`);
    }

    const [newOrder] = await db
      .insert(orders)
      .values({
        productId: targetProduct.id,
        customerEmail: "demo@example.com",
        quantity: 2,
        status: "confirmed",
      })
      .returning();

    console.log(
      `  Created order ${newOrder.id} for "${targetProduct.name}" x${newOrder.quantity}\n`
    );

    // ── 4. Query with filters ─────────────────────────────────────────
    console.log("--- Electronics Products ---");
    const electronics = await db
      .select()
      .from(products)
      .where(like(products.tags, "%electronics%"));

    for (const p of electronics) {
      console.log(`  ${p.name} — $${(p.price / 100).toFixed(2)}`);
    }
    console.log();

    // ── 5. Update order status ────────────────────────────────────────
    console.log("--- Update Order ---");
    const [updated] = await db
      .update(orders)
      .set({ status: "shipped" })
      .where(eq(orders.id, newOrder.id))
      .returning();

    console.log(`  Order ${updated.id} status: ${updated.status}\n`);

    // ── 6. Clean up demo order ────────────────────────────────────────
    console.log("--- Cleanup ---");
    await db.delete(orders).where(eq(orders.id, newOrder.id));
    console.log(`  Deleted order ${newOrder.id}\n`);

    console.log("=== Demo complete ===");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Demo failed:", err);
  process.exit(1);
});
