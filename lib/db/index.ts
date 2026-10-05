import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Db = NeonHttpDatabase<typeof schema>;

let db: Db | undefined;

/**
 * Lazy singleton. Importing this module never touches the environment, so
 * guest-mode builds and routes that never call getDb() work without
 * DATABASE_URL; only an actual query path fails, and fails loudly.
 */
export function getDb(): Db {
  if (db) return db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — the Postgres store is unavailable. Guest mode uses localStorage and does not need it.",
    );
  }
  db = drizzle(neon(url), { schema });
  return db;
}

export function hasDb(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export { schema };
