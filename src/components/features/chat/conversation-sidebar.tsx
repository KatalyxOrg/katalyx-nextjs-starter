"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MessageSquarePlus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { t } from "@/lib/strings";
import {
  deleteConversationAction,
  renameConversationAction,
} from "@/server/actions/conversations";
import type { ConversationSummary } from "@/server/db/conversations";

type AgentOption = {
  id: string;
  name: string;
  description: string;
};

type ConversationSidebarProps = {
  conversations: ConversationSummary[];
  agents: AgentOption[];
  selectedAgentId: string;
};

function ConversationSidebar({
  conversations,
  agents,
  selectedAgentId,
}: ConversationSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<ConversationSummary | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  function handleRename() {
    if (!renameTarget) return;

    startTransition(async () => {
      const result = await renameConversationAction({
        conversationId: renameTarget.id,
        title: renameTitle,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(t("Conversation renommée."));
      setRenameTarget(null);
      router.refresh();
    });
  }

  function handleDelete(conversationId: string) {
    startTransition(async () => {
      const result = await deleteConversationAction({ conversationId });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(t("Conversation supprimée."));
      setMenuOpenId(null);

      if (pathname === `/assistant/${conversationId}`) {
        router.push("/assistant");
      }

      router.refresh();
    });
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="border-b border-sidebar-border p-4">
        <Link
          href="/assistant"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-all duration-150 hover:bg-muted"
        >
          <MessageSquarePlus className="h-4 w-4" />
          {t("Nouvelle conversation")}
        </Link>

        {agents.length > 1 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("Agent")}
            </p>
            <div className="space-y-1">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    agent.id === selectedAgentId
                      ? "bg-sidebar-active text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-xs">{agent.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            {t("Aucune conversation pour le moment.")}
          </p>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conversation) => {
              const href = `/assistant/${conversation.id}`;
              const isActive = pathname === href;

              return (
                <li key={conversation.id} className="group relative">
                  <Link
                    href={href}
                    className={cn(
                      "block rounded-lg px-3 py-2 pr-10 text-sm transition-colors duration-150",
                      isActive
                        ? "bg-sidebar-active text-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-hover",
                    )}
                  >
                    <p className="truncate font-medium">{conversation.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(conversation.updatedAt))}
                    </p>
                  </Link>

                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    <DropdownMenu
                      open={menuOpenId === conversation.id}
                      onClose={() => setMenuOpenId(null)}
                      trigger={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          onClick={() =>
                            setMenuOpenId((current) =>
                              current === conversation.id ? null : conversation.id,
                            )
                          }
                          aria-label={t("Actions")}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          setRenameTarget(conversation);
                          setRenameTitle(conversation.title);
                          setMenuOpenId(null);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        {t("Renommer")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(conversation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t("Supprimer")}
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={renameTarget !== null} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Renommer la conversation")}</DialogTitle>
          </DialogHeader>
          <Input
            value={renameTitle}
            onChange={(event) => setRenameTitle(event.target.value)}
            label={t("Titre")}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              {t("Annuler")}
            </Button>
            <Button onClick={handleRename} isLoading={pending}>
              {t("Enregistrer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

export { ConversationSidebar };
