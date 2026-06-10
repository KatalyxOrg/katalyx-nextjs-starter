"use client";

import type { UIMessage } from "ai";
import { useEffect, useRef } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/lib/strings";
import { MessageSquare } from "lucide-react";

import { MessageBubble } from "./message-bubble";

type ChatMessagesProps = {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
};

function ChatMessages({ messages, status }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-10 w-10" />}
        title={t("Commencez une conversation")}
        description={t("Posez une question ou demandez de l'aide à l'assistant.")}
        className="h-full"
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {status === "submitted" && (
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-16 w-64 rounded-lg" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

export { ChatMessages };
