This folder holds **server-only** code. Client components must not import from here (except via Server Actions or route handlers).

When you add backend logic, follow this layering:

1. **`validators/`** — Zod schemas for all external inputs (forms, JSON, query params).
2. **`actions/`** — `"use server"` functions: parse with Zod, call services, return `{ success, data?, error? }` with safe French error messages.
3. **`services/`** — Business logic; no React. May call `db/` and external APIs.
4. **`db/`** — Prisma (or other persistence) calls only; map to shared types in `src/lib/`.

Route handlers in `src/app/api/**` use the same validation → service pattern for non-browser clients.

Do not expose secrets in `NEXT_PUBLIC_*` variables.
