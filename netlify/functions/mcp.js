import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { searchKnowledge, DATA } from "./knowledge.js";
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const server = new McpServer({ name: "atef-shop-mcp", version: "2.0.0" });

  server.tool("search_info", { query: z.string() }, async ({query}) => {
    return { content: [{ type: "text", text: searchKnowledge(query) }] };
  });

  server.tool("list_all_data", {}, async () => {
    return { content: [{ type: "text", text: JSON.stringify(DATA, null, 2) }] };
  });

  server.tool("create_order", {
    product: z.string(),
    quantity: z.number(),
    customer_name: z.string(),
    phone: z.string(),
    address: z.string()
  }, async ({product, quantity, customer_name, phone, address}) => {
    const store = getStore("orders");
    const orderId = "ORD-" + Date.now().toString().slice(-6);
    const order = { orderId, product, quantity, customer_name, phone, address, date: new Date().toISOString(), status: "جديد" };
    await store.setJSON(orderId, order);
    return { content: [{ type: "text", text: `✅ تم تسجيل الطلب بنجاح!\nرقم الطلب: ${orderId}\nالمنتج: ${product} x${quantity}\nالعميل: ${customer_name}\nالهاتف: ${phone}\nالعنوان: ${address}\nسيتم الاتصال بك في 24 ساعة للتأكيد.` }] };
  });

  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  return transport.handleRequest(req);
};
