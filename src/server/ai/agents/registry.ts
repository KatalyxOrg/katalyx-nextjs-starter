import type { ToolSet } from "ai";

import { builtInTools } from "@/server/ai/tools/built-in";

export type AgentConfig = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  /** Model id from the catalog (`src/server/ai/providers.ts`). Omit to use `DEFAULT_MODEL_ID` / first available model. */
  modelId?: string;
  mcpServerIds: string[];
  tools: ToolSet;
  maxSteps: number;
};

export const AGENT_REGISTRY: AgentConfig[] = [
  {
    id: "assistant",
    name: "Assistant",
    description: "Assistant généraliste pour répondre aux questions et utiliser les outils disponibles.",
    systemPrompt: [
      "Tu es un assistant utile et concis.",
      "Réponds en français sauf demande contraire de l'utilisateur.",
      "Utilise les outils disponibles lorsque cela améliore la précision de ta réponse.",
      "Si tu ne connais pas la réponse, dis-le clairement.",
    ].join(" "),
    mcpServerIds: [],
    tools: builtInTools,
    maxSteps: 10,
  },
];

export function getAgent(agentId: string): AgentConfig {
  const agent = AGENT_REGISTRY.find((entry) => entry.id === agentId);
  if (!agent) {
    throw new Error(`Agent inconnu : ${agentId}`);
  }
  return agent;
}

export function listAgents(): Pick<AgentConfig, "id" | "name" | "description">[] {
  return AGENT_REGISTRY.map(({ id, name, description }) => ({ id, name, description }));
}

export function getDefaultAgentId(): string {
  return AGENT_REGISTRY[0]?.id ?? "assistant";
}
