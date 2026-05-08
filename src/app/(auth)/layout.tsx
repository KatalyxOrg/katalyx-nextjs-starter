import { t } from "@/lib/strings";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5">
        <Link href="/" className="text-sm font-semibold text-foreground hover:text-primary">
          {APP_NAME}
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 pb-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        {t("Application Katalyx")}
      </footer>
    </main>
  );
}
