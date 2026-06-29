import { defineConfig } from "drizzle-kit";
import path from "path";

const rawDatabaseUrl = process.env.DATABASE_URL;
const databaseUrl = rawDatabaseUrl
  ?.trim()
  .replace(/\s+/gu, "")
  .replace(/^"(.+)"$|^'(.+)'$/u, "$1$2");

const postgresUrlPattern =
  /^(postgres(?:ql)?:\/\/)([^:@\/\s]+)(?::([^@:\/\s]*))?@([^\/\s]+)(\/.*)$/u;

if (!databaseUrl) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

if (!postgresUrlPattern.test(databaseUrl)) {
  throw new Error(
    "DATABASE_URL is malformed. Use a valid PostgreSQL URL like postgresql://user:password@host:port/db.",
  );
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
