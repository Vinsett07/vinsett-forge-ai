import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const dir = path.resolve("netlify/database/migrations");
const files = (await readdir(dir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
try {
  for (const file of files) {
    const body = await readFile(path.join(dir, file, "migration.sql"), "utf8");
    await sql.unsafe(body);
    console.log(`applied ${file}`);
  }
} finally { await sql.end(); }
