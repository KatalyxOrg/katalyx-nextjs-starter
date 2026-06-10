import type { UIMessage } from "ai";
import { generateId } from "ai";
import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/server/db/client";

export type ConversationSummary = {
  id: string;
  agentId: string;
  title: string;
  updatedAt: Date;
  createdAt: Date;
};

export type ConversationWithMessages = ConversationSummary & {
  messages: UIMessage[];
};

function toUiMessage(message: {
  id: string;
  role: string;
  parts: unknown;
}): UIMessage {
  return {
    id: message.id,
    role: message.role as UIMessage["role"],
    parts: message.parts as UIMessage["parts"],
  };
}

export async function createConversation({
  userId,
  agentId,
  title = "Nouvelle conversation",
}: {
  userId: string;
  agentId: string;
  title?: string;
}): Promise<ConversationSummary> {
  return prisma.conversation.create({
    data: { userId, agentId, title },
    select: {
      id: true,
      agentId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getConversationWithMessages({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}): Promise<ConversationWithMessages | null> {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) return null;

  return {
    id: conversation.id,
    agentId: conversation.agentId,
    title: conversation.title,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messages: conversation.messages.map(toUiMessage),
  };
}

/** Latest conversation without any message — reused instead of creating duplicates. */
export async function findEmptyConversation({
  userId,
  agentId,
}: {
  userId: string;
  agentId: string;
}): Promise<ConversationSummary | null> {
  return prisma.conversation.findFirst({
    where: { userId, agentId, messages: { none: {} } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      agentId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/** Conversations with at least one message (blank drafts are hidden from the sidebar). */
export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  return prisma.conversation.findMany({
    where: { userId, messages: { some: {} } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      agentId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export type AppendMessagesResult =
  | { ok: true; appended: number }
  | { ok: false; reason: "not_found" | "empty" };

/** Last occurrence wins — guards against duplicate ids in AI SDK batches. */
export function dedupeMessagesById(messages: UIMessage[]): UIMessage[] {
  const byId = new Map<string, UIMessage>();
  for (const message of messages) {
    byId.set(message.id, message);
  }
  return [...byId.values()];
}

/**
 * Messages not yet stored for this conversation (DB is the source of truth).
 * Handles stream continuation where the assistant message keeps the same id.
 */
export function getMessagesToPersist({
  finalMessages,
  persistedMessageIds,
  isContinuation,
}: {
  finalMessages: UIMessage[];
  persistedMessageIds: Set<string>;
  isContinuation: boolean;
}): UIMessage[] {
  const deduped = dedupeMessagesById(finalMessages);

  const delta = deduped.filter((message) => !persistedMessageIds.has(message.id));

  if (isContinuation) {
    const last = deduped.at(-1);
    if (
      last &&
      persistedMessageIds.has(last.id) &&
      !delta.some((message) => message.id === last.id)
    ) {
      delta.push(last);
    }
  }

  return delta;
}

export async function appendMessages({
  conversationId,
  userId,
  messages,
}: {
  conversationId: string;
  userId: string;
  messages: UIMessage[];
}): Promise<AppendMessagesResult> {
  const uniqueMessages = dedupeMessagesById(messages);
  if (uniqueMessages.length === 0) {
    return { ok: false, reason: "empty" };
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    select: { id: true },
  });

  if (!conversation) {
    return { ok: false, reason: "not_found" };
  }

  const existingRows = await prisma.message.findMany({
    where: { id: { in: uniqueMessages.map((message) => message.id) } },
    select: { id: true, conversationId: true },
  });
  const existingById = new Map(existingRows.map((row) => [row.id, row]));

  const operations = uniqueMessages.map((message) => {
    const parts = message.parts as Prisma.InputJsonValue;
    const existing = existingById.get(message.id);

    if (!existing) {
      return prisma.message.create({
        data: {
          id: message.id,
          conversationId,
          role: message.role,
          parts,
        },
      });
    }

    if (existing.conversationId === conversationId) {
      return prisma.message.update({
        where: { id: message.id },
        data: { role: message.role, parts },
      });
    }

    // Global id collision (stale client state) — never mutate another conversation.
    console.warn("[db] message id collision across conversations", {
      messageId: message.id,
      targetConversationId: conversationId,
      existingConversationId: existing.conversationId,
    });

    return prisma.message.create({
      data: {
        id: generateId(),
        conversationId,
        role: message.role,
        parts,
      },
    });
  });

  await prisma.$transaction([
    ...operations,
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return { ok: true, appended: uniqueMessages.length };
}

export async function renameConversation({
  conversationId,
  userId,
  title,
}: {
  conversationId: string;
  userId: string;
  title: string;
}): Promise<ConversationSummary | null> {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    select: { id: true },
  });

  if (!conversation) return null;

  return prisma.conversation.update({
    where: { id: conversationId },
    data: { title },
    select: {
      id: true,
      agentId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function deleteConversation({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}): Promise<boolean> {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    select: { id: true },
  });

  if (!conversation) return false;

  await prisma.conversation.delete({ where: { id: conversationId } });
  return true;
}

export async function updateConversationTitle({
  conversationId,
  userId,
  title,
}: {
  conversationId: string;
  userId: string;
  title: string;
}): Promise<void> {
  await prisma.conversation.updateMany({
    where: { id: conversationId, userId },
    data: { title },
  });
}

export function deriveConversationTitle(messages: UIMessage[]): string {
  const firstUserMessage = messages.find((message) => message.role === "user");
  if (!firstUserMessage) return "Nouvelle conversation";

  const textPart = firstUserMessage.parts.find(
    (part): part is { type: "text"; text: string } => part.type === "text",
  );

  const text = textPart?.text?.trim();
  if (!text) return "Nouvelle conversation";

  return text.length > 60 ? `${text.slice(0, 57)}...` : text;
}
