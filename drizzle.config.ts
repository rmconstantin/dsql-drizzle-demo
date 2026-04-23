import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.CLUSTER_ENDPOINT!,
    port: 5432,
    user: process.env.CLUSTER_USER ?? "admin",
    password: process.env.PGPASSWORD!,
    database: "postgres",
    ssl: true,
  },
});
