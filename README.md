# katalyx-nextjs-starter

Modèle minimal [Next.js 16](https://nextjs.org/) (App Router, React 19, TypeScript strict, Tailwind CSS v4) pour lancer rapidement des applications **Katalyx**.

## Contenu

- **Jeton de design** Katalyx (`src/app/globals.css`) — accent primaire `#E85431`, modes clair/sombre, animations de base.
- **Composants UI** dans `src/components/ui/` (primitives sans shell applicatif).
- **Conventions** dans [`AGENTS.md`](AGENTS.md) (couches server, Zod, chaînes en français).
- **Env** : validation Zod dans `src/server/env.ts` + `.env.example`.
- **Chaînes UI** : helper `t()` dans `src/lib/strings.ts`.
- **Base de données** : Prisma 7 (driver adapter `pg`) + PostgreSQL via `docker/docker-compose.yml`.
- **Authentification + RBAC** : Better Auth (e-mail/mot de passe) avec plugins `admin` et `organization`. Guards serveur dans `src/server/auth/guards.ts`.
- **Agents IA** : couche provider-agnostic (AI SDK 6 — OpenAI, Anthropic), outils MCP configurables, chat persistant sur `/assistant`.
- **Docker** : image standalone (voir `docker/`) et workflow GitHub Actions (lint, typecheck, build).

## Démarrage

```bash
cp .env.example .env
# Générer un secret Better Auth (>=32 caractères)
echo "BETTER_AUTH_SECRET=\"$(openssl rand -base64 32)\"" >> .env

npm install

# Démarrer PostgreSQL (compose)
docker compose -f docker/docker-compose.yml up -d db

# Optionnel : pgAdmin (http://localhost:5050 — voir section Docker du README)
# docker compose -f docker/docker-compose.yml up -d db pgadmin

# Appliquer le schéma
npm run db:migrate

npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) puis créer un compte sur `/sign-up`.

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Démarrer le build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | `prisma migrate dev` (dev) |
| `npm run db:deploy` | `prisma migrate deploy` (prod) |
| `npm run db:generate` | Régénérer le client Prisma |
| `npm run db:studio` | Ouvrir Prisma Studio |
| `npm run db:seed` | Exécuter `prisma/seed.ts` |
| `npm run auth:generate` | Régénérer les modèles auth dans `prisma/schema.prisma` |

## Authentification & RBAC

- **Inscription ouverte** : `/sign-up` crée un utilisateur avec `role = "user"`. Connexion sur `/sign-in`.
- **Promotion admin** : `npm run db:studio`, ouvrir la table `user`, passer `role` à `"admin"` (ou via une requête one-shot).
- **Routes protégées** : `/dashboard` (toute session), `/assistant` (toute session) et `/admin` (rôle `admin`). Le pré-filtre cookie est dans [src/proxy.ts](src/proxy.ts) ; les véritables vérifications se font via les guards serveur dans [src/server/auth/guards.ts](src/server/auth/guards.ts) — `requireSession`, `requireRole`, `requireOrgRole`.
- **Plugins activés** : `admin` (rôles globaux + bannissement + impersonation) et `organization` (multi-tenant, équipes, invitations). Voir [Better Auth docs](https://www.better-auth.com/docs).
- **Régénérer le schéma auth** après ajout/retrait de plugins : `npm run auth:generate && npm run db:migrate`.

## Docker

Depuis la racine du dépôt (le répertoire contenant `package.json`) :

```bash
docker compose -f docker/docker-compose.yml build
docker compose -f docker/docker-compose.yml up
```

Le contexte de build est la racine du projet ; `dockerfile` pointe vers `docker/Dockerfile`.

L’application écoute sur le port **3000**. Adaptez `NEXT_PUBLIC_APP_URL` pour la prod.

**pgAdmin** (si vous lancez la stack complète ou `docker compose … up -d pgadmin`) : interface sur [http://localhost:5050](http://localhost:5050). Identifiants par défaut : e-mail `admin@local.dev`, mot de passe `admin` (surchargeables via `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD`). Pour enregistrer le serveur PostgreSQL : hôte **`db`**, port **5432**, utilisateur **`app`**, mot de passe **`app`**, base **`app`** (depuis un conteneur sur le même réseau Compose). Depuis la machine hôte uniquement Prisma ou un client local : hôte **`localhost`**, port **5432**.
## Agents IA

1. Ajouter une clé dans `.env` : `OPENAI_API_KEY` et/ou `ANTHROPIC_API_KEY` (optionnel : `DEFAULT_MODEL_ID`).
2. Démarrer l'app et ouvrir `/assistant` après connexion.
3. **Étendre un agent** : éditer `src/server/ai/agents/registry.ts` (prompt système, modèle, outils).
4. **Brancher un serveur MCP** : ajouter une entrée dans `src/server/ai/mcp/registry.ts`, puis référencer son `id` dans `mcpServerIds` de l'agent.
5. **Réutiliser l'UI** : composants dans `src/components/features/chat/` (`ChatPanel`, sidebar, rendu markdown + outils).

Voir la section **AI agents** dans [`AGENTS.md`](AGENTS.md) pour l'architecture complète.

## Prochaines étapes

Ajouter selon le produit : logique métier sous `src/server/services/` et queries dans `src/server/db/`.
