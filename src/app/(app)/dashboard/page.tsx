import type { Metadata } from "next";

import { t } from "@/lib/strings";
import { requireSession } from "@/server/auth/guards";
import { pageMetadata } from "@/server/seo/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: t("Tableau de bord"),
  description: t("Espace utilisateur."),
  path: "/dashboard",
});

export default async function DashboardPage() {
  const session = await requireSession();
  const role = (session.user as { role?: string | null }).role ?? "user";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {t("Bonjour")}, {session.user.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("Bienvenue dans votre espace.")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="text-xs uppercase text-muted-foreground tracking-wide">
            {t("Rôle")}
          </div>
          <div className="mt-1 text-lg font-medium text-foreground">{role}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="text-xs uppercase text-muted-foreground tracking-wide">
            {t("Identifiant")}
          </div>
          <div className="mt-1 text-sm font-mono text-foreground break-all">
            {session.user.id}
          </div>
        </div>
      </div>
    </div>
  );
}
