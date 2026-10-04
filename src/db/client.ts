import { drizzle } from "drizzle-orm/postgres-js";
import { getConnectionString } from "@netlify/database";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  vinsettSql?: ReturnType<typeof postgres>;
};

export function connectionString(): string {
  // Explicit URLs keep local development and CI independent of Netlify.
  return process.env.DATABASE_URL?.trim() || getConnectionString();
}

export function getDb() {
  const sql = globalForDb.vinsettSql ?? postgres(connectionString(), {
    max: process.env.NODE_ENV === "production" ? 3 : 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
  // Reuse one connection pool per process, including production requests.
  globalForDb.vinsettSql = sql;
  return drizzle(sql, { schema });
}
