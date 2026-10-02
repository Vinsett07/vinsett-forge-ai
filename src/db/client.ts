import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  vinsettSql?: ReturnType<typeof postgres>;
};

function connectionString(): string {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL is not configured.");
  return value;
}

export function getDb() {
  const sql = globalForDb.vinsettSql ?? postgres(connectionString(), {
    max: process.env.NODE_ENV === "production" ? 10 : 1,
    prepare: false,
  });
  if (process.env.NODE_ENV !== "production") globalForDb.vinsettSql = sql;
  return drizzle(sql, { schema });
}
