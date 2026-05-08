"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="rounded-lg border border-destructive/20 bg-destructive-light p-6">
        <h2 className="text-lg font-semibold text-foreground">Une erreur est survenue.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {process.env.NODE_ENV === "development" ? error.message : "Veuillez réessayer ou contacter le support."}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => reset()}>
          Réessayer
        </Button>
      </div>
    </div>
  );
}
