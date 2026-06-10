import type { UIMessage } from "ai";
import { NextResponse } from "next/server";

import { getAgent } from "@/server/ai/agents/registry";
import { runAgent } from "@/server/ai/agents/run";
import { hasConfiguredProvider } from "@/server/ai/providers";
import { getSession } from "@/server/auth/guards";
import {
  appendMessages,
  deriveConversationTitle,
  getConversationWithMessages,
  getMessagesToPersist,
  updateConversationTitle,
} from "@/server/db/conversations";
import { chatRequestSchema } from "@/server/validators/chat";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  if (!hasConfiguredProvider()) {
    return NextResponse.json(
      { error: "Aucun fournisseur IA configuré." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const { agentId, messages, conversationId } = parsed.data;

  if (!conversationId) {
    return NextResponse.json({ error: "Conversation requise." }, { status: 400 });
  }

  try {
    getAgent(agentId);
  } catch {
    return NextResponse.json({ error: "Agent inconnu." }, { status: 400 });
  }

  const existing = await getConversationWithMessages({
    conversationId,
    userId: session.user.id,
  });

  if (!existing) {
    return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });
  }

  const originalMessages = messages as UIMessage[];
  const persistedMessageIds = new Set(existing.messages.map((message) => message.id));

  try {
    const result = await runAgent({
      agentId,
      messages: originalMessages,
    });

    return result.toUIMessageStreamResponse({
      originalMessages,
      onFinish: async ({ messages: finalMessages, isAborted, isContinuation }) => {
        if (isAborted) return;

        const toPersist = getMessagesToPersist({
          finalMessages: finalMessages as UIMessage[],
          persistedMessageIds,
          isContinuation,
        });

        if (toPersist.length === 0) return;

        try {
          const persisted = await appendMessages({
            conversationId,
            userId: session.user.id,
            messages: toPersist,
          });

          if (!persisted.ok) {
            if (persisted.reason === "not_found") {
              console.error("[api/chat] onFinish: conversation deleted during stream", {
                conversationId,
                userId: session.user.id,
              });
            }
            return;
          }

          const conversation = await getConversationWithMessages({
            conversationId,
            userId: session.user.id,
          });

          if (conversation && conversation.title === "Nouvelle conversation") {
            await updateConversationTitle({
              conversationId,
              userId: session.user.id,
              title: deriveConversationTitle(finalMessages as UIMessage[]),
            });
          }
        } catch (error) {
          console.error("[api/chat] onFinish persistence failed", {
            conversationId,
            userId: session.user.id,
            error,
          });
        }
      },
    });
  } catch (error) {
    console.error("[api/chat]", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la génération." },
      { status: 500 },
    );
  }
}
