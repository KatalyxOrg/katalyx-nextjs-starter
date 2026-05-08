import type { Metadata } from "next";

import { t } from "@/lib/strings";
import { pageMetadata } from "@/server/seo/site-metadata";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = pageMetadata({
  title: t("Connexion"),
  description: t("Se connecter à son compte."),
  path: "/sign-in",
});

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">{t("Connexion")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("Entrez vos identifiants pour accéder à votre espace.")}
        </p>
      </div>
      <SignInForm />
    </div>
  );
}
