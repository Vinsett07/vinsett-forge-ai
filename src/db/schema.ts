import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const projectStatus = pgEnum("project_status", ["draft", "active", "paused", "done"]);

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  problem: text("problem").notNull(),
  audience: text("audience").notNull(),
  outcome: text("outcome").notNull(),
  status: projectStatus("status").default("draft").notNull(),
  plan: jsonb("plan"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
