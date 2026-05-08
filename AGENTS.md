# AGENTS.md — Katalyx Next.js starter

**Audience:** coding agents. **Goal:** shared engineering conventions for all Katalyx Next.js apps. This file does not describe a specific product domain.

---

## AI quick reference

| Item | Rule |
|------|------|
| Stack | Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, npm. Alias `@/*` → `src/*`. |
| Backend boundary | `src/server/**` is **server-only** — never import from `"use client"` components. Browser code uses **Server Actions** or `fetch` to `src/app/api/**` when needed. |
| Data flow | Route Handler or `"use server"` action → **Zod** (`src/server/validators/`) → **service** → **db** (only persistence calls). No skipping layers once you add them. |
| Auth & RBAC | Better Auth (`src/server/auth/auth.ts`) + guards (`src/server/auth/guards.ts`). Roles checked via `requireRole` / `requireOrgRole` — never in client components. |
| Database | Prisma 7 with `@prisma/adapter-pg` + PostgreSQL. Schema in `prisma/schema.prisma` (auth models owned by `npm run auth:generate`). |
| Action shape | Return `{ success, data?, error? }`. Validate all inputs server-side. Do not `throw` raw errors to the client from actions. |
| Secrets | No secrets in `NEXT_PUBLIC_*`. Validate env in `src/server/env.ts` (fail-fast in production where applicable). |
| UI copy | **All user-visible strings in French.** Use `t()` from `@/lib/strings` for literals (easier grep / future i18n). Code identifiers in **English.** (Applies to title/description and schema.org text surfaced in SERPs.) |
| SEO | Use `t()` for user-facing title/description/schema text. See **SEO** below. |
| Hygiene | Prefer `rm` in terminal over fragile delete tools if a file must be removed. |

**Commands:** `npm run dev` | `npm run build` | `npm run lint` | `npm run typecheck`

---

## Architecture map

**Roots**

- `src/app/` — routes, layouts, `api/` (REST for integrations, webhooks, non-browser clients).
- `src/server/actions/` — `"use server"` mutations.
- `src/server/services/` — business logic (no React).
- `src/server/db/` — persistence queries only (e.g. Prisma), when you add a database.
- `src/server/validators/` — Zod schemas.
- `src/server/seo/` — metadata helpers (`getRootMetadata`, `pageMetadata`); depends on `env`.
- `src/components/ui|layout|features/` — UI; optional domain folders under `features/<area>/`; `components/seo/` for JSON-LD shell.
- `src/lib/seo/` — structured data (JSON-LD) builders; pure data — URLs/names passed in from server pages.
- `src/lib/` — shared utils and types safe for client + server.
- `src/hooks/` — client hooks.
- `docker/` — optional container build and compose.

**SEO (metadata & discovery)** — Base URL from `env` (`NEXT_PUBLIC_APP_URL`). Root and per-route metadata: `src/server/seo/site-metadata.ts` (`getRootMetadata`, `pageMetadata`) — **server-only**, not for `"use client"`. Sitemap / robots: `src/app/sitemap.ts`, `src/app/robots.ts`. JSON-LD: build maps in `src/lib/seo/structured-data.ts`, render with `JsonLd` (`src/components/seo/json-ld.tsx`).

**Layering**

```
Browser/CLI ──► Server Actions / fetch ──► src/server/actions/* ──► services ──► db ──► persistence
```

**Page components:** compose UI only — keep business rules in server layers or hooks.

---

## Backend patterns (summary)

**Server Action**

1. `"use server"` at top.
2. Parse `FormData` or JSON with Zod `safeParse`.
3. On failure: `{ success: false, error: "…" }` (French user messages).
4. Call service; on success `{ success: true, data }`; catch unexpected errors and map to safe messages.

**Route Handler:** `NextResponse.json`, same Zod gate; for non-browser clients.

---

## Environment variables

Maintain `.env.example` with keys, no secrets. `NEXT_PUBLIC_*` is exposed to the browser — only non-sensitive values. Extend `src/server/env.ts` with Zod as you add integrations.

---

## Design system (Katalyx)

- **Primary accent:** `#E85431` — use CSS variables in `src/app/globals.css` (`--primary`, semantic colors), avoid one-off hex in components.
- **Shape:** default radius `rounded-lg` (8px) unless specified otherwise.
- **Motion:** subtle, ~150–200ms.
- **Icons:** Lucide (`lucide-react`).
- **Avoid:** generic “AI slop” aesthetics (purple gradients, heavy drop shadows).

---

## Code style

- TypeScript strict; avoid careless `any` / unsafe `as`.
- One component or hook per file; kebab-case filenames for components.
- Import order: React/Next → external → `@/components` → `@/lib` / `@/hooks` → `@/server` (only in server contexts) → types.
- PascalCase components, `camelCase` functions, `use-*` hooks, `*Schema` validators, SCREAMING_SNAKE constants.

---

## Security & compliance

1. Do not expose provider API keys or private tokens to the client.
2. Errors: user-facing safe messages; no stack traces in production UI.
3. Validation: every external mutation validated with Zod.
4. Accessibility: meaningful labels, keyboard navigation, reasonable contrast.
5. **RGPD:** plan data retention and deletion for any personal data you store.

---

## Quality bar

- Remove dead code; extract duplicate patterns when they stabilize.
- Async views: loading, error, empty, and success states where it matters.
- Use route-level `loading.tsx` / `error.tsx` where appropriate.

---

## Auth, RBAC & DB (Prisma + Better Auth)

- **Persistence:** all DB calls go through `src/server/db/` (Prisma client + adapter-pg). The generated client lives in `src/generated/prisma/` (gitignored, regenerated via `npm run db:generate`).
- **Auth instance:** `src/server/auth/auth.ts` — Better Auth with `emailAndPassword`, `admin`, `organization`, `nextCookies()` plugins. Schema is generated via `npm run auth:generate` (writes to `prisma/schema.prisma`).
- **Access control:** **only** through `src/server/auth/guards.ts` (`requireSession`, `requireRole("admin")`, `requireOrgRole(orgId, role)`). Never check roles in `"use client"` components — pages and server actions call these guards.
- **Edge pre-filter:** `src/proxy.ts` (Next 16 proxy / former middleware) does a cookie presence check for `/dashboard` and `/admin` before render. Real authorization still happens server-side.
- **Client SDK:** `src/lib/auth-client.ts` exports `signIn`, `signUp`, `signOut`, `useSession`, `admin`, `organization` (Better Auth React client with `adminClient` + `organizationClient` plugins).
- **Schema migrations:** edit `prisma/schema.prisma` (auth models are owned by `auth:generate` — re-run it instead of hand-editing those blocks), then `npm run db:migrate`.
- **Roles:** application roles are `admin` | `user` (default `user`). Organization roles are `owner` | `admin` | `member`.

## What this starter is **not**

This template stays minimal: **no email verification, no OAuth, no domain features.** Add providers, magic link, 2FA, or product code per app, following the layering above.
