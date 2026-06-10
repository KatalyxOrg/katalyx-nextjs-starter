import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";
import { Experimental_StdioMCPTransport } from "@ai-sdk/mcp/mcp-stdio";
import type { ToolSet } from "ai";

import { getMcpServer, type McpServerConfig } from "@/server/ai/mcp/registry";

async function createClientForServer(server: McpServerConfig): Promise<MCPClient> {
  if (server.transport.type === "http") {
    return createMCPClient({
      transport: {
        type: "http",
        url: server.transport.url,
        headers: server.transport.headers,
      },
    });
  }

  return createMCPClient({
    transport: new Experimental_StdioMCPTransport({
      command: server.transport.command,
      args: server.transport.args,
      env: server.transport.env,
    }),
  });
}

export type McpToolsHandle = {
  tools: ToolSet;
  /** Close all underlying MCP clients. Safe to call multiple times. */
  close: () => Promise<void>;
};

/**
 * Connect to the given MCP servers and merge their tools.
 *
 * The caller owns the lifecycle: call `close()` once the LLM stream has
 * finished (e.g. in `streamText`'s `onFinish` / `onError`), not before —
 * tools are invoked lazily during streaming.
 */
export async function acquireMcpTools(mcpServerIds: string[]): Promise<McpToolsHandle> {
  const clients: MCPClient[] = [];
  const tools: ToolSet = {};
  let closed = false;

  const close = async () => {
    if (closed) return;
    closed = true;
    await Promise.all(clients.map((client) => client.close().catch(() => undefined)));
  };

  try {
    for (const serverId of mcpServerIds) {
      const server = getMcpServer(serverId);
      if (!server) continue;

      const client = await createClientForServer(server);
      clients.push(client);

      Object.assign(tools, await client.tools());
    }
  } catch (error) {
    await close();
    throw error;
  }

  return { tools, close };
}
