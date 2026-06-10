"use server";

import { requireSession } from "@/server/auth/guards";
import {
  deleteConversation,
  listConversations,
  renameConversation,
} from "@/server/db/conversations";
import { deleteConversationSchema, renameConversationSchema } from "@/server/validators/chat";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function listConversationsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listConversations>>>
> {
  try {
    const session = await requireSession();
    const conversations = await listConversations(session.user.id);
    return { success: true, data: conversations };
  } catch {
    return { success: false, error: "Impossible de charger les conversations." };
  }
}

export async function renameConversationAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<typeof renameConversation>>>> {
  const parsed = renameConversationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Données invalides." };
  }

  try {
    const session = await requireSession();
    const conversation = await renameConversation({
      conversationId: parsed.data.conversationId,
      userId: session.user.id,
      title: parsed.data.title,
    });

    if (!conversation) {
      return { success: false, error: "Conversation introuvable." };
    }

    return { success: true, data: conversation };
  } catch {
    return { success: false, error: "Impossible de renommer la conversation." };
  }
}

export async function deleteConversationAction(
  input: unknown,
): Promise<ActionResult<boolean>> {
  const parsed = deleteConversationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Données invalides." };
  }

  try {
    const session = await requireSession();
    const deleted = await deleteConversation({
      conversationId: parsed.data.conversationId,
      userId: session.user.id,
    });

    if (!deleted) {
      return { success: false, error: "Conversation introuvable." };
    }

    return { success: true, data: true };
  } catch {
    return { success: false, error: "Impossible de supprimer la conversation." };
  }
}
