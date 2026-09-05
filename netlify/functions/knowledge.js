// netlify/functions/knowledge.js - ما تبدلوش

export const DATA = {
  company: "Atef Shop",
  description: "متجر إلكتروني تونسي لبيع الإكسسوارات التقنية",
  products: [
    { id: 1, name: "سماعات Bluetooth P9", price: "45 د.ت", stock: true },
    { id: 2, name: "ساعة ذكية T800", price: "89 د.ت", stock: true },
    { id: 3, name: "حامل هاتف للسيارة", price: "25 د.ت", stock: false },
    { id: 4, name: "كابل Type-C سريع", price: "15 د.ت", stock: true }
  ],
  shipping: {
    tunis: "7 د.ت - توصيل في 24 ساعة",
    other: "8-12 د.ت - توصيل في 48 ساعة",
    free_threshold: "فما توصيل مجاني فوق 150 د.ت"
  },
  returns: "الارجاع مقبول في 7 أيام إذا المنتج ما تفتحش",
  hours: "من الإثنين للسبت: 9 صباحا - 7 مساء",
  contact: "الهاتف: 22 123 456 - إنستغرام: @atefshop.tn"
};

export function searchKnowledge(query) {
  const q = query.toLowerCase();
  let results = [];

  if (q.includes("منتج") || q.includes("شنو") || q.includes("سماع") || q.includes("ساعة") || q.includes("product")) {
    results.push("المنتجات: " + JSON.stringify(DATA.products));
  }
  if (q.includes("توصيل") || q.includes("shipping") || q.includes("تونس")) {
    results.push("التوصيل: " + JSON.stringify(DATA.shipping));
  }
  if (q.includes("ارجاع") || q.includes("return")) {
    results.push(DATA.returns);
  }
  if (q.includes("ساعة") && q.includes("عمل") || q.includes("وقت")) {
    results.push(DATA.hours);
  }
  if (q.includes("اتصال") || q.includes("contact")) {
    results.push(DATA.contact);
  }

  if (results.length === 0) {
    // لو ما فهمش، رجع الكل
    return JSON.stringify(DATA, null, 2).slice(0, 2000);
  }

  return results.join("\n\n");
}
