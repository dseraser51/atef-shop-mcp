export const DATA = {
  "الشركة": "شركة Atef Shop في نابل، تبيع اكسسوارات هاتف و لابتوب",
  "التوصيل": "التوصيل 48 ساعة لكامل تونس، مجاني فوق 150د",
  "الارجاع": "عندك 7 ايام باش ترجع المنتوج اذا فيه مشكلة",
  "المنتجات": "عندنا: كابل iPhone ب 25د، سماعات Bluetooth ب 89د، شاحن سريع 65W ب 75د، موس حلاقة ب 10د  ، بطاقات قوقل بلاي متاع 10 دولال ب 35د ",
  "ساعات العمل": "من الاثنين للسبت 9h - 19h"
};

export function searchKnowledge(query){
  const q = query.toLowerCase();
  let results = [];
  for(const [k,v] of Object.entries(DATA)){
    if(q.includes(k.toLowerCase()) || v.toLowerCase().includes(q) || k.toLowerCase().includes(q)){
      results.push(`${k}: ${v}`);
    }
  }
  if(results.length===0){
    return Object.values(DATA).join("\n");
  }
  return results.join("\n");
}
