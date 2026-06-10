import { Bot } from "lucide-react";

import { ConversationSidebar } from "@/components/features/chat/conversation-sidebar";
import { EmptyState } from "@/components/ui/empty-state";
import { t } from "@/lib/strings";
import { getDefaultAgentId, hasConfiguredProvider, listAgents } from "@/server/ai";
import { requireSession } from "@/server/auth/guards";
import { listConversations } from "@/server/db/conversations";

export default async function AssistantLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const hasProvider = hasConfiguredProvider();
  const conversations = await listConversations(session.user.id);
  const agents = listAgents();
  const defaultAgentId = getDefaultAgentId();

  if (!hasProvider) {
    return (
      <div className="-mx-6 -my-8 flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
        <EmptyState
          icon={<Bot className="h-10 w-10" />}
          title={t("Assistant IA non configuré")}
          description={t(
            "Ajoutez au moins une clé API (OPENAI_API_KEY ou ANTHROPIC_API_KEY) dans votre fichier .env pour activer l'assistant.",
          )}
        />
      </div>
    );
  }

  return (
    <div className="-mx-6 -my-8 flex h-[calc(100vh-73px)] overflow-hidden">
      <ConversationSidebar
        conversations={conversations}
        agents={agents}
        selectedAgentId={defaultAgentId}
      />
      <div className="flex min-w-0 flex-1 flex-col bg-background">{children}</div>
    </div>
  );
}
