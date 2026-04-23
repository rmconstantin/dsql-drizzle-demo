/**
 * Run Drizzle migrations against Aurora DSQL.
 *
 * Usage:
 *   CLUSTER_ENDPOINT=abc123.dsql.us-east-1.on.aws tsx src/migrate.ts
 */

import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb } from "./db/connection.js";

async function main() {
  const { db, pool } = createDb();

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete.");

  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
