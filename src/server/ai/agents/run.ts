import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type StreamTextResult,
  type ToolSet,
  type UIMessage,
} from "ai";

import { getAgent } from "@/server/ai/agents/registry";
import { acquireMcpTools } from "@/server/ai/mcp/client";
import { getDefaultModelId, getModel } from "@/server/ai/providers";

export async function runAgent({
  agentId,
  messages,
}: {
  agentId: string;
  messages: UIMessage[];
}): Promise<StreamTextResult<ToolSet, never>> {
  const agent = getAgent(agentId);

  const modelId = agent.modelId ?? getDefaultModelId();
  if (!modelId) {
    throw new Error("Aucun fournisseur IA configuré.");
  }
  const model = getModel(modelId);

  // MCP clients must stay open for the whole stream: tools are called lazily.
  const mcp = await acquireMcpTools(agent.mcpServerIds);

  const tools: ToolSet = {
    ...agent.tools,
    ...mcp.tools,
  };

  try {
    return streamText({
      model,
      system: agent.systemPrompt,
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(agent.maxSteps),
      onFinish: async () => {
        await mcp.close();
      },
      onError: async () => {
        await mcp.close();
      },
      onAbort: async () => {
        await mcp.close();
      },
    });
  } catch (error) {
    await mcp.close();
    throw error;
  }
}
