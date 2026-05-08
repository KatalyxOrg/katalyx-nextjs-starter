"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth-client";
import { t } from "@/lib/strings";

export function SignUpForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    setPending(true);
    const { error } = await signUp.email({ name, email, password });
    setPending(false);

    if (error) {
      toast.error(error.message ?? t("Impossible de créer le compte."));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label={t("Nom")} name="name" type="text" autoComplete="name" required />
      <Input label={t("Adresse e-mail")} name="email" type="email" autoComplete="email" required />
      <Input
        label={t("Mot de passe")}
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint={t("8 caractères minimum.")}
      />
      <Button type="submit" isLoading={pending} className="w-full">
        {t("Créer le compte")}
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        {t("Déjà inscrit ?")}{" "}
        <Link href="/sign-in" className="text-primary hover:underline">
          {t("Se connecter")}
        </Link>
      </p>
    </form>
  );
}
