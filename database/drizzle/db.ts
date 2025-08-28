import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function dbPostgres() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  
  const client = postgres(process.env.DATABASE_URL);
  return drizzle(client);
}

// Keep backward compatibility
export const dbSqlite = dbPostgres;
