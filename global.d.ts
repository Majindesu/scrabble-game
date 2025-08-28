import type { dbSqlite } from "./database/drizzle/db";

declare global {
  namespace Vike {
    interface PageContext {
      db: ReturnType<typeof dbSqlite>;
    }
  }
}
