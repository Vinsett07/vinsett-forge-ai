import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const dir = path.resolve("db/migrations");
const files = (await readdir(dir)).filter((name) => name.endsWith(".sql")).sort();
try {
  for (const file of files) {
    const body = await readFile(path.join(dir, file), "utf8");
    await sql.unsafe(body);
    console.log(`applied ${file}`);
  }
} finally { await sql.end(); }
