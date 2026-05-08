import type { Metadata } from "next";

import { t } from "@/lib/strings";
import { pageMetadata } from "@/server/seo/site-metadata";

import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = pageMetadata({
  title: t("Créer un compte"),
  description: t("Créer un nouveau compte utilisateur."),
  path: "/sign-up",
});

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">{t("Créer un compte")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("Quelques informations suffisent pour démarrer.")}
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}
