"use client";

import { useRef, type FormEvent, type KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/strings";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
};

function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  disabled = false,
  isStreaming = false,
  placeholder,
}: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim() || disabled || isStreaming) return;
    onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="border-t border-border bg-card px-4 py-4"
    >
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t("Écrivez votre message…")}
          disabled={disabled}
          rows={1}
          className="min-h-[44px] max-h-40 resize-none"
        />

        {isStreaming ? (
          <Button type="button" variant="outline" size="icon" onClick={onStop} aria-label={t("Arrêter")}>
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            disabled={disabled || !value.trim()}
            aria-label={t("Envoyer")}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {t("Entrée pour envoyer, Maj+Entrée pour un saut de ligne.")}
      </p>
    </form>
  );
}

export { ChatInput };
