/**
 * Aurora DSQL-compatible Drizzle schema.
 *
 * Key constraints for DSQL:
 *  - Use UUID primary keys (no serial/bigserial)
 *  - No foreign key constraints (enforce in application code)
 *  - No jsonb columns (use json instead)
 *  - No array columns (use text, comma-separated)
 *  - Indexes must be created with CREATE INDEX ASYNC
 */

import { pgTable, uuid, varchar, text, timestamp, integer, json } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  price: integer("price").notNull(), // stored in cents
  tags: text("tags"), // comma-separated, e.g. "electronics,sale,featured"
  metadata: json("metadata"), // native JSON column (DSQL supports json, not jsonb)
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull(), // no .references() — enforced in app
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});
