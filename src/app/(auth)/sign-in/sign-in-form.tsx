"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import { getSafeInternalPath } from "@/lib/safe-internal-path";
import { t } from "@/lib/strings";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeInternalPath(searchParams.get("redirect"));
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    setPending(true);
    const { error } = await signIn.email({ email, password });
    setPending(false);

    if (error) {
      toast.error(t("Identifiants invalides."));
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label={t("Adresse e-mail")} name="email" type="email" autoComplete="email" required />
      <Input
        label={t("Mot de passe")}
        name="password"
        type="password"
        autoComplete="current-password"
        required
        minLength={8}
      />
      <Button type="submit" isLoading={pending} className="w-full">
        {t("Se connecter")}
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        {t("Pas encore de compte ?")}{" "}
        <Link href="/sign-up" className="text-primary hover:underline">
          {t("Créer un compte")}
        </Link>
      </p>
    </form>
  );
}
