import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Same .env.local resolution as `next dev`.
loadEnvConfig(process.cwd());

// `db:generate` is offline (schema → SQL). `db:migrate` needs DATABASE_URL.
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
