"use client";

import type { UIMessage } from "ai";
import { getToolName, isToolUIPart } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { t } from "@/lib/strings";

import { ToolInvocation } from "./tool-invocation";

type MessageBubbleProps = {
  message: UIMessage;
};

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn("flex max-w-[85%] flex-col gap-2", isUser ? "items-end" : "items-start")}>
        <p className="text-xs font-medium text-muted-foreground">
          {isUser ? t("Vous") : t("Assistant")}
        </p>

        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <div
                key={`${message.id}-text-${index}`}
                className={cn(
                  "rounded-lg px-4 py-2.5 text-sm leading-relaxed",
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-foreground",
                )}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{part.text}</p>
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            );
          }

          if (part.type === "reasoning") {
            return (
              <details
                key={`${message.id}-reasoning-${index}`}
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
              >
                <summary className="cursor-pointer text-muted-foreground">{t("Raisonnement")}</summary>
                <p className="mt-2 whitespace-pre-wrap text-foreground">{part.text}</p>
              </details>
            );
          }

          if (isToolUIPart(part)) {
            const toolName = getToolName(part);
            return (
              <div key={`${message.id}-tool-${index}`} className="w-full min-w-[280px]">
                <ToolInvocation
                  toolName={toolName}
                  state={part.state}
                  input={"input" in part ? part.input : undefined}
                  output={"output" in part ? part.output : undefined}
                  errorText={"errorText" in part ? part.errorText : undefined}
                />
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

export { MessageBubble };
