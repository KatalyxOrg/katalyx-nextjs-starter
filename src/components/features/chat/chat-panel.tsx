"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { StatusMessage } from "@/components/ui/empty-state";
import { t } from "@/lib/strings";

import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";

type ChatPanelProps = {
  agentId: string;
  conversationId: string;
  initialMessages?: UIMessage[];
  disabled?: boolean;
};

function ChatPanel({
  agentId,
  conversationId,
  initialMessages = [],
  disabled = false,
}: ChatPanelProps) {
  const router = useRouter();
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          agentId,
          conversationId,
        },
      }),
    [agentId, conversationId],
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport,
    onFinish: () => {
      // Refresh server components so the sidebar picks up the
      // newly persisted conversation and its auto-generated title.
      router.refresh();
    },
    onError: () => {
      toast.error(t("Une erreur est survenue lors de la génération."));
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChatMessages messages={messages} status={status} />

      {error && (
        <div className="px-4 pb-2">
          <StatusMessage type="error" message={t("La génération a échoué. Réessayez.")} />
        </div>
      )}

      <ChatInput
        value={input}
        onChange={setInput}
        disabled={disabled}
        isStreaming={isStreaming}
        onStop={stop}
        onSubmit={() => {
          const text = input.trim();
          if (!text) return;
          sendMessage({ text });
          setInput("");
        }}
      />
    </div>
  );
}

export { ChatPanel };
