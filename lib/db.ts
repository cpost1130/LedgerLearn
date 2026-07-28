import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Lazy-initialize db to avoid calling neon() at build time
// when DATABASE_URL may not be available
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(process.env.DATABASE_URL);
    _db = drizzle(sql);
  }
  return _db;
}

// Export a proxy so all existing `db.query.xxx` calls work transparently
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
}) as ReturnType<typeof getDb>;
