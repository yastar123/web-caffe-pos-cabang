import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const rawDatabaseUrl = process.env.DATABASE_URL;
const databaseUrl = rawDatabaseUrl
  ?.trim()
  .replace(/\s+/gu, "")
  .replace(/^"(.+)"$|^'(.+)'$/u, "$1$2");

const postgresUrlPattern =
  /^(postgres(?:ql)?:\/\/)([^:@\/\s]+)(?::([^@:\/\s]*))?@([^\/\s]+)(\/.*)$/u;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let parsedDatabaseUrl;
try {
  parsedDatabaseUrl = new URL(databaseUrl);
} catch {
  throw new Error(
    "DATABASE_URL is invalid. Please check the connection string in your environment variables.",
  );
}

if (!postgresUrlPattern.test(databaseUrl)) {
  throw new Error(
    "DATABASE_URL is malformed. Use a valid PostgreSQL URL like postgresql://user:password@host:port/db. " +
      "Encode reserved characters such as '/', '@', and spaces in username/password.",
  );
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
