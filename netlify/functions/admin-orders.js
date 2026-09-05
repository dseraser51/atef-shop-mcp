import { getStore } from "@netlify/blobs";

export default async (req) => {
  // حماية بسيطة بكلمة سر
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  
  if (!secret || secret !== process.env.MY_ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized - كلمة السر غالطة" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const store = getStore("orders");
    const list = await store.list();
    
    const orders = [];
    for (const blob of list.blobs) {
      const order = await store.get(blob.key, { type: "json" });
      if (order) orders.push(order);
    }

    // رتب من الجديد للقديم
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    return new Response(JSON.stringify(orders), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, orders: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};