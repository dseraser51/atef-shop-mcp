import { searchKnowledge, DATA } from "./knowledge.js";

const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_info",
      description: "استعملها باش تلوج على أي معلومة تخص شركة Atef Shop: منتجات، توصيل، ارجاع، ساعات عمل",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "كلمة البحث، مثلا: منتجات، توصيل، سماعات" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_all_data",
      description: "جيب كل المعلومات المتوفرة في قاعدة البيانات",
      parameters: { type: "object", properties: {}, required: [] }
    }
  }
];

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" } });
  }

  const { message } = await req.json();
  if (!message) return new Response(JSON.stringify({ error: "message missing" }), { status: 400 });

  let messages = [
    {
      role: "system",
      content: `انت Agent ذكي لشركة Atef Shop.
القاعدة: ما تجاوبش من راسك. لازم تستعمل الـ tools باش تجيب المعلومة من MCP قبل ما تجاوب.
اذا سألك على منتج، استعمل search_info.
اذا ما لقيتش، قول المعلومة مش متوفرة.`
    },
    { role: "user", content: message }
  ];

  // Agent Loop - max 5 مرات باش ما يدخلش في boucle
  for (let step = 0; step < 5; step++) {
    const gmiRes = await fetch(process.env.GMI_API_URL || "https://api.gmi-serving.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GMI_API_KEY}`
      },
      body: JSON.stringify({
        model: "MiniMaxAI/MiniMax-M3",
        messages: messages,
        tools: TOOLS,
        tool_choice: "auto",
        max_tokens: 1024,
        temperature: 0.2
      })
    });

    if (!gmiRes.ok) {
      const err = await gmiRes.text();
      return new Response(JSON.stringify({ error: err }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const gmiData = await gmiRes.json();
    const assistantMsg = gmiData.choices?.[0]?.message;

    // اذا المودال قرر يكلم MCP
    if (assistantMsg?.tool_calls && assistantMsg.tool_calls.length > 0) {
      messages.push(assistantMsg);

      for (const toolCall of assistantMsg.tool_calls) {
        const name = toolCall.function.name;
        let args = {};
        try { args = JSON.parse(toolCall.function.arguments); } catch(e) {}

        let result = "";
        if (name === "search_info") {
          result = searchKnowledge(args.query || "");
        } else if (name === "list_all_data") {
          result = JSON.stringify(DATA, null, 2);
        } else {
          result = "Tool not found";
        }

        // رجع نتيجة الـ tool للمودال
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result
        });
      }
      continue; // عاود كلم المودال مرة اخرى بالنتيجة
    } else {
      // المودال جاوب نهائيا بلا ما يحتاج tool
      return new Response(JSON.stringify({
        answer: assistantMsg?.content || "ما جاوبش",
        steps: step + 1,
        usedTools: messages.filter(m => m.role === 'tool').length > 0
      }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  }

  return new Response(JSON.stringify({ answer: "وصلت للحد الأقصى من البحث، حاول بسؤال آخر" }), {
    headers: { "Content-Type": "application/json" }
  });
};
