export type McpHttpTransport = {
  type: "http";
  url: string;
  headers?: Record<string, string>;
};

export type McpStdioTransport = {
  type: "stdio";
  command: string;
  args?: string[];
  env?: Record<string, string>;
};

export type McpTransport = McpHttpTransport | McpStdioTransport;

export type McpServerConfig = {
  id: string;
  label: string;
  transport: McpTransport;
  enabled: boolean;
};

/**
 * Register MCP servers for your project here.
 * Agents reference servers by `id` in `src/server/ai/agents/registry.ts`.
 */
export const MCP_SERVER_REGISTRY: McpServerConfig[] = [
  // Example (disabled by default):
  // {
  //   id: "docs",
  //   label: "Documentation",
  //   enabled: false,
  //   transport: {
  //     type: "http",
  //     url: "https://your-mcp-server.example.com/mcp",
  //     headers: {
  //       Authorization: `Bearer ${process.env.MCP_DOCS_API_KEY ?? ""}`,
  //     },
  //   },
  // },
];

export function getMcpServer(id: string): McpServerConfig | undefined {
  return MCP_SERVER_REGISTRY.find((server) => server.id === id && server.enabled);
}

export function listMcpServers(): McpServerConfig[] {
  return MCP_SERVER_REGISTRY.filter((server) => server.enabled);
}
