import dotenv from "dotenv";
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });
import path from "node:path";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  // DATABASE_URL is only required for migrate / studio. prisma generate does not
  // need a DB connection, so we skip the datasource block when the var is absent
  // (avoids crashing during `npm install` / Docker build before .env is set up).
  ...(process.env.DATABASE_URL
    ? {
        datasource: {
          url: env("DATABASE_URL"),
        },
      }
    : {}),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
});
