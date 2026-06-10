import { redirect } from "next/navigation";

import { getDefaultAgentId } from "@/server/ai";
import { requireSession } from "@/server/auth/guards";
import { createConversation, findEmptyConversation } from "@/server/db/conversations";

export default async function AssistantPage() {
  const session = await requireSession();
  const agentId = getDefaultAgentId();

  // Reuse an existing empty conversation to avoid piling up blank rows
  // when the user opens /assistant repeatedly.
  const existing = await findEmptyConversation({ userId: session.user.id, agentId });
  const conversation =
    existing ?? (await createConversation({ userId: session.user.id, agentId }));

  redirect(`/assistant/${conversation.id}`);
}
