import type { Metadata } from "next";
import { headers } from "next/headers";

import { t } from "@/lib/strings";
import { auth } from "@/server/auth/auth";
import { requireRole } from "@/server/auth/guards";
import { pageMetadata } from "@/server/seo/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: t("Administration"),
  description: t("Gestion des utilisateurs."),
  path: "/admin",
});

export default async function AdminPage() {
  await requireRole("admin");

  const result = await auth.api.listUsers({
    headers: await headers(),
    query: { limit: 50 },
  });

  const users = result?.users ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("Administration")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("Liste des utilisateurs et leurs rôles.")}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{t("Nom")}</th>
              <th className="px-4 py-3 font-medium">{t("E-mail")}</th>
              <th className="px-4 py-3 font-medium">{t("Rôle")}</th>
              <th className="px-4 py-3 font-medium">{t("Statut")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  {t("Aucun utilisateur.")}
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 text-foreground">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                    {user.role ?? "user"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {user.banned ? t("Banni") : t("Actif")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("Promotion : utiliser `npm run db:studio` pour modifier `role` à `admin`.")}
      </p>
    </div>
  );
}
