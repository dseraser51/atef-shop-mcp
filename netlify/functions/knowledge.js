export const DATA = {
  "الشركة": "شركة Atef Shop في نابل، تبيع اكسسوارات هاتف و لابتوب - atefshop.tn - 22 456 123",
  "التوصيل": "التوصيل 48 ساعة لكامل تونس (24 ساعة لتونس العاصمة)، مجاني فوق 150د، 7د اقل من 150د",
  "الارجاع": "عندك 7 ايام باش ترجع المنتوج اذا فيه مشكلة",
  "المنتجات": "1. سماعات P9 45د - متوفر ✅ | 2. ساعة ذكية T800 89د - متوفر ✅ | 3. حامل هاتف للسيارة 25د - نفد ❌ | 4. كابل Type-C سريع 15د - متوفر ✅ | 5. شاحن 65W سريع 75د - متوفر ✅",
  "ساعات العمل": "الاثنين للسبت 9 صباحا - 7 مساء",
  "الدفع": "الدفع عند الاستلام"
};

export function searchKnowledge(query){
  const q = query.toLowerCase();
  let results = [];
  for(const [k,v] of Object.entries(DATA)){
    if(q.includes(k.toLowerCase()) || v.toLowerCase().includes(q) || k.toLowerCase().includes(q)){
      results.push(`${k}: ${v}`);
    }
  }
  if(results.length===0) return Object.values(DATA).join("\n");
  return results.join("\n");
}
