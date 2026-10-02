import { eq } from "drizzle-orm";
import { getDb } from "@/src/db/client";
import { users } from "@/src/db/schema";

export async function findUserByEmail(email: string) {
  const rows = await getDb().select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] ?? null;
}

export async function createUser(input: { displayName: string; email: string; passwordHash: string }) {
  const rows = await getDb().insert(users).values(input).returning({
    id: users.id,
    displayName: users.displayName,
    email: users.email,
  });
  return rows[0];
}
