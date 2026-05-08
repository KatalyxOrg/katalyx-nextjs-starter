import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { t } from "@/lib/strings";
import { requireSession } from "@/server/auth/guards";

import { SignOutButton } from "./sign-out-button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const role = (session.user as { role?: string | null }).role ?? "user";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-semibold text-foreground">
              {APP_NAME}
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground">
                {t("Tableau de bord")}
              </Link>
              {role === "admin" && (
                <Link href="/admin" className="hover:text-foreground">
                  {t("Administration")}
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
