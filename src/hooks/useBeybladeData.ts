import { useState, useEffect, useMemo } from 'react';

export function useBeybladeData(BASE_URL: string, lang: string) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const t = Date.now();
        const [mRes, pRes] = await Promise.all([
          fetch(`${BASE_URL}beyblade_product_master.json?t=${t}`).then(res => res.json()),
          fetch(`${BASE_URL}beyblade_price_inventory.json?t=${t}`).then(res => res.json())
        ]);
        setProducts(mRes.map((p: any) => ({ ...p, price: pRes[p.model]?.price_jpy || null })));
      } catch (e) {
        console.error("Data Error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [BASE_URL]);

  const getC = (p: any, key: string, l: string) => p[`${key}_${l}`] || p[`${key}_zh_hk`] || "";

  const getDisplayName = (p: any, l: string) => {
    if (!p) return "";
    const chip = getC(p, 'chip', l);
    const main = getC(p, 'main_blade', l);
    const assist = getC(p, 'assist_blade', l);
    const code = p.assist_blade_code ? `(${p.assist_blade_code})` : "";
    return `${chip}${main}${assist}${code}`.trim() || p.model;
  };

  const pool = useMemo(() => {
    const r = new Set<string>(); const b = new Set<string>(); const a = new Set<string>();
    products.forEach((p) => { 
      if (p.ratchet) r.add(p.ratchet); 
      if (p.bit_code) b.add(p.bit_code); 
      if (p.assist_blade_code) a.add(p.assist_blade_code);
    });
    return { ratchets: Array.from(r).sort(), bits: Array.from(b).sort(), assists: Array.from(a).sort() };
  }, [products]);

  return { products, loading, pool, getDisplayName, getC };
}