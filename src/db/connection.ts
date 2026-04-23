/**
 * DSQL connection using the official DSQL node-postgres connector.
 * Handles IAM token generation and refresh automatically.
 */

import { AuroraDSQLPool } from "@aws/aurora-dsql-node-postgres-connector";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

export function createPool() {
  const host = process.env.CLUSTER_ENDPOINT;
  const user = process.env.CLUSTER_USER ?? "admin";

  if (!host) {
    throw new Error(
      "CLUSTER_ENDPOINT is required. Set it to your DSQL cluster endpoint, e.g. abc123.dsql.us-east-1.on.aws"
    );
  }

  return new AuroraDSQLPool({
    host,
    user,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

export function createDb() {
  const pool = createPool();
  const db = drizzle({ client: pool, schema });
  return { db, pool };
}
