import { defineConfig } from "drizzle-kit";
import path from "path";

const rawDatabaseUrl = process.env.DATABASE_URL;
const databaseUrl = rawDatabaseUrl
  ?.trim()
  .replace(/^"(.+)"$|^\'(.+)\'$/u, "$1$2");

if (!databaseUrl) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
