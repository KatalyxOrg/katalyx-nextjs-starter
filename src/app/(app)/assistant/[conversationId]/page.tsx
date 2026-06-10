import { notFound } from "next/navigation";

import { ChatPanel } from "@/components/features/chat/chat-panel";
import { requireSession } from "@/server/auth/guards";
import { getConversationWithMessages } from "@/server/db/conversations";

type AssistantConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function AssistantConversationPage({
  params,
}: AssistantConversationPageProps) {
  const session = await requireSession();
  const { conversationId } = await params;

  const conversation = await getConversationWithMessages({
    conversationId,
    userId: session.user.id,
  });

  if (!conversation) {
    notFound();
  }

  return (
    <ChatPanel
      key={conversation.id}
      agentId={conversation.agentId}
      conversationId={conversation.id}
      initialMessages={conversation.messages}
    />
  );
}
