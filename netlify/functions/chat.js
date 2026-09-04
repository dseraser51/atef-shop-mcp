import { searchKnowledge } from "./knowledge.js";

export default async (req) => {
  if(req.method === "OPTIONS"){
    return new Response("", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" } });
  }
  const { message } = await req.json();
  if(!message) return new Response(JSON.stringify({ error: "message missing" }), { status: 400 });

  // 1. جيب المعلومات من الـ MCP (من knowledge.js مباشرة باش اسرع)
  const context = searchKnowledge(message);

  // 2. كلم MiniMax-M3 على GMI
  const gmiRes = await fetch(process.env.GMI_API_URL || "https://api.gmi-serving.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GMI_API_KEY}`
    },
    body: JSON.stringify({
      model: "MiniMaxAI/MiniMax-M3",
      messages: [
        { role: "system", content: `انت مساعد لشركة Atef Shop. جاوب كان من المعلومات اللي نعطيهالك. اذا المعلومة مش موجودة قول: المعلومة هاذي مش متوفرة عندي حاليا.\n\nمعلومات الشركة:\n${context}` },
        { role: "user", content: message }
      ],
      max_tokens: 1024,
      temperature: 0.3
    })
  });

  if(!gmiRes.ok){
    const err = await gmiRes.text();
    return new Response(JSON.stringify({ error: err }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const gmiData = await gmiRes.json();
  const answer = gmiData.choices?.[0]?.message?.content || "ما جاوبش";

  return new Response(JSON.stringify({ answer, contextUsed: context }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
};