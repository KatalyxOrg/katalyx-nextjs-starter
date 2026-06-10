"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Wrench } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { t } from "@/lib/strings";

type ToolInvocationProps = {
  toolName: string;
  state: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function stateLabel(state: string): string {
  switch (state) {
    case "input-streaming":
      return t("Préparation…");
    case "input-available":
      return t("Exécution…");
    case "output-available":
      return t("Terminé");
    case "output-error":
      return t("Erreur");
    default:
      return state;
  }
}

function ToolInvocation({ toolName, state, input, output, errorText }: ToolInvocationProps) {
  const [open, setOpen] = useState(false);
  const isRunning = state === "input-streaming" || state === "input-available";

  return (
    <div className="rounded-lg border border-border bg-muted/40 text-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/60 transition-colors duration-150"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <Wrench className="h-4 w-4 shrink-0 text-primary" />
        <span className="font-medium text-foreground">{toolName}</span>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1 text-xs",
            isRunning && "text-muted-foreground",
            state === "output-available" && "text-success",
            state === "output-error" && "text-destructive",
          )}
        >
          {isRunning && <Loader2 className="h-3 w-3 animate-spin" />}
          {stateLabel(state)}
        </span>
      </button>

      {open && (
        <div className="space-y-2 border-t border-border px-3 py-2">
          {input !== undefined && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">{t("Entrée")}</p>
              <pre className="overflow-x-auto rounded-md bg-card p-2 text-xs text-foreground">
                {formatJson(input)}
              </pre>
            </div>
          )}
          {output !== undefined && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">{t("Sortie")}</p>
              <pre className="overflow-x-auto rounded-md bg-card p-2 text-xs text-foreground">
                {formatJson(output)}
              </pre>
            </div>
          )}
          {errorText && (
            <div>
              <p className="mb-1 text-xs font-medium text-destructive">{t("Erreur")}</p>
              <pre className="overflow-x-auto rounded-md bg-destructive-light p-2 text-xs text-destructive">
                {errorText}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { ToolInvocation };
