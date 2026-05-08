"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { t } from "@/lib/strings";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    await signOut();
    setPending(false);
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={onClick} isLoading={pending}>
      {t("Se déconnecter")}
    </Button>
  );
}
