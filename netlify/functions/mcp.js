import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { searchKnowledge, DATA } from "./knowledge.js";

export default async (req) => {
  const server = new McpServer({ name: "atef-shop-mcp", version: "1.0.0" });

  server.tool("search_info", {
    query: z.string().describe("كلمة البحث")
  }, async ({query}) => {
    return { content: [{ type: "text", text: searchKnowledge(query) }] };
  });

  server.tool("list_all_data", {}, async () => {
    return { content: [{ type: "text", text: JSON.stringify(DATA, null, 2) }] };
  });

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });
  await server.connect(transport);
  return transport.handleRequest(req);
};