import { searchKnowledge, DATA } from "./knowledge.js";
import { getStore } from "@netlify/blobs";

const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_info",
      description: "لوج على معلومة في قاعدة بيانات الشركة: منتجات، توصيل، اسعار",
      parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] }
    }
  },
  {
    type: "function",
    function: {
      name: "list_all_data",
      description: "جيب كل المعلومات",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "create_order",
      description: "استعملها فقط كي يحب المستخدم يعدي كوموند ويكون عندك الاسم والهاتف والعنوان والمنتج والكمية الكل. ما تكلمهاش اذا ناقص معلومة، اسأل المستخدم قبل.",
      parameters: {
        type: "object",
        properties: {
          product: { type: "string", description: "اسم المنتج" },
          quantity: { type: "number", description: "الكمية" },
          customer_name: { type: "string", description: "اسم العميل" },
          phone: { type: "string", description: "رقم الهاتف" },
          address: { type: "string", description: "العنوان الكامل مع المدينة" }
        },
        required: ["product", "quantity", "customer_name", "phone", "address"]
      }
    }
  }
];

export default async (req) => {
  if (req.method === "OPTIONS") return new Response("", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" } });
  const { message } = await req.json();

  let messages = [
    { role: "system", content: `انت Agent لمحل Atef Shop. مهمتك:
1. تجاوب كان من MCP عبر search_info
2. اذا المستخدم يحب يعدي كوموند: لازم تلم 5 حاجات قبل ما تستعمل create_order: اسم المنتج، الكمية، اسم العميل، رقم الهاتف، العنوان. اذا ناقص حاجة اسألو.
3. بعد ما تعدي الكوموند اعطيه رقم الطلب وقلو سيتم الاتصال به.
تكلم بالدارجة التونسية باحترام.` },
    { role: "user", content: message }
  ];

  for (let step = 0; step < 6; step++) {
    const gmiRes = await fetch(process.env.GMI_API_URL || "https://api.gmi-serving.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GMI_API_KEY}` },
      body: JSON.stringify({ model: "MiniMaxAI/MiniMax-M3", messages, tools: TOOLS, tool_choice: "auto", max_tokens: 1024, temperature: 0.2 })
    });
    if (!gmiRes.ok) { const err = await gmiRes.text(); return new Response(JSON.stringify({ error: err }), { status: 500, headers: { "Content-Type": "application/json" } }); }
    const gmiData = await gmiRes.json();
    const assistantMsg = gmiData.choices?.[0]?.message;

    if (assistantMsg?.tool_calls?.length > 0) {
      messages.push(assistantMsg);
      for (const tc of assistantMsg.tool_calls) {
        const name = tc.function.name;
        let args = {}; try { args = JSON.parse(tc.function.arguments); } catch {}
        let result = "";
        if (name === "search_info") result = searchKnowledge(args.query || "");
        else if (name === "list_all_data") result = JSON.stringify(DATA, null, 2);
        else if (name === "create_order") {
          const store = getStore("orders");
          const orderId = "ORD-" + Date.now().toString().slice(-6);
          const order = { orderId, product: args.product, quantity: args.quantity, customer_name: args.customer_name, phone: args.phone, address: args.address, date: new Date().toISOString(), status: "جديد" };
          await store.setJSON(orderId, order);
          result = `✅ تم تسجيل الطلب بنجاح!\nرقم الطلب: ${orderId}\nالمنتج: ${args.product} x${args.quantity}\nالعميل: ${args.customer_name}\nالهاتف: ${args.phone}\nالعنوان: ${args.address}`;
        }
        messages.push({ role: "tool", tool_call_id: tc.id, content: result });
      }
      continue;
    } else {
      return new Response(JSON.stringify({ answer: assistantMsg?.content || "" }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    }
  }
  return new Response(JSON.stringify({ answer: "وصلت للحد الأقصى" }), { headers: { "Content-Type": "application/json" } });
};
