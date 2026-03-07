import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Star, Zap, Shield, Globe, ChevronDown, ListChecks, Trash2, Settings, TrendingUp, LayoutGrid } from 'lucide-react';

const UI_TEXT: any = {
  zh_hk: { ARSENAL: "產品名錄", INTEL: "零件匹配", SYSTEM: "BEYBLADE-X SYSTEM", QUERY: "輸入搜索指令...", R_POOL: "⚙️ RATCHET 池", B_POOL: "🔰 BIT 軸心池", A_POOL: "🔪 ASSIST 刃部池", SCORE: "匹配得分", LOADING: "加載中...", PRICE_LABEL: "官方定價", ITEMS_FOUND: "項結果", OPTIMAL: "最佳獲取建議" },
  zh_tw: { ARSENAL: "產品清單", INTEL: "零件匹配", SYSTEM: "BEYBLADE-X SYSTEM", QUERY: "搜尋中...", R_POOL: "⚙️ RATCHET 池", B_POOL: "🔰 BIT 軸心池", A_POOL: "🔪 ASSIST 刃部池", SCORE: "匹配得分", LOADING: "啟動中...", PRICE_LABEL: "官方定價", ITEMS_FOUND: "項結果", OPTIMAL: "最佳獲取建議" },
  en: { ARSENAL: "ARSENAL", INTEL: "MATCHING", SYSTEM: "BEYBLADE-X SYSTEM", QUERY: "QUERY TERMINAL...", R_POOL: "⚙️ R_POOL", B_POOL: "🔰 B_POOL", A_POOL: "🔪 A_POOL", SCORE: "SCORE", RECENT: "HISTORY", LOADING: "BOOTING...", PRICE_LABEL: "MSRP", ITEMS_FOUND: "items", OPTIMAL: "OPTIMAL" }
};

export default function BeybladeApp() {
  const BASE_URL = import.meta.env.BASE_URL || "/";
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ARSENAL");
  const [lang, setLang] = useState("zh_hk");
  const [theme, setTheme] = useState("dark");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSeries, setCurrentSeries] = useState("all");
  const [currentGet, setCurrentGet] = useState("all");
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [sortKey, setSortKey] = useState("model");
  const [sortOrder, setSortOrder] = useState("asc");

  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem("bey_favs") || "[]"));
  const [wishlist, setWishlist] = useState<any>(() => JSON.parse(localStorage.getItem("bey_wishlist") || '{"ratchet":[],"bit":[],"assist":[]}'));

  const clickCount = useRef(0);
  const ui = UI_TEXT[lang] || UI_TEXT.zh_hk;

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
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchData();
  }, [BASE_URL]);

  useEffect(() => {
    localStorage.setItem("bey_favs", JSON.stringify(favorites));
    localStorage.setItem("bey_wishlist", JSON.stringify(wishlist));
  }, [favorites, wishlist]);

  const handleEggTrigger = () => {
    clickCount.current += 1;
    setTimeout(() => { clickCount.current = 0; }, 1000);
    if (clickCount.current >= 3) setTheme(prev => prev === 'pink' ? 'dark' : 'pink');
  };

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
      if (p.ratchet) r.add(p.ratchet); if (p.bit_code) b.add(p.bit_code); if (p.assist_blade_code) a.add(p.assist_blade_code);
    });
    return { ratchets: Array.from(r).sort(), bits: Array.from(b).sort(), assists: Array.from(a).sort() };
  }, [products]);

  const recommendations = useMemo(() => {
    if (!wishlist.ratchet.length && !wishlist.bit.length && !wishlist.assist.length) return [];
    return products.map((p: any) => {
      let score = 0;
      const matched = [];
      if (wishlist.ratchet.includes(p.ratchet)) { score++; matched.push(p.ratchet); }
      if (wishlist.bit.includes(p.bit_code)) { score++; matched.push(p.bit_code); }
      if (p.assist_blade_code && wishlist.assist.includes(p.assist_blade_code)) { score++; matched.push(p.assist_blade_code); }
      return { ...p, score, matched };
    }).filter(p => p.score > 0).sort((a, b) => b.score - a.score);
  }, [products, wishlist]);

  const processedProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const name = getDisplayName(p, lang).toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || p.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeries = currentSeries === "all" || p.type === currentSeries;
      const matchesGet = currentGet === "all" || (currentGet === "box" ? p.data_get?.includes('×') : p.data_get === currentGet);
      const matchesFav = !showFavOnly || favorites.includes(p.model);
      return matchesSearch && matchesSeries && matchesGet && matchesFav;
    });
    return [...filtered].sort((a, b) => {
      let vA = a[sortKey] || (sortKey === 'price' ? 99999 : 'zzz');
      let vB = b[sortKey] || (sortKey === 'price' ? 99999 : 'zzz');
      return sortOrder === "asc" ? (vA < vB ? -1 : 1) : (vA > vB ? -1 : 1);
    });
  }, [products, searchTerm, currentSeries, currentGet, showFavOnly, sortKey, sortOrder, lang, favorites]);

  const themeClass = theme === 'pink' ? "bg-[#1a0010] text-[#ff71ce]" : theme === 'light' ? "bg-white text-black" : "bg-[#050505] text-cyan-50";

  if (loading) return <div className="h-screen flex items-center justify-center font-mono text-cyan-500 bg-black animate-pulse text-3xl italic">RESTORING_ALL_SYSTEMS...</div>;

  return (
    <div className={`min-h-screen transition-all font-sans pb-24 no-scrollbar ${themeClass}`}>
      
      {/* 1. Navbar */}
      <nav className={`p-4 border-b flex justify-between items-center sticky top-0 z-[100] shadow-xl backdrop-blur-lg ${
        theme === 'light' ? 'bg-white border-black' : 'bg-black/95 border-cyan-900/50'
      }`}>
        <div className="flex items-center gap-2">
          <Settings className={theme==='light' ? 'text-black' : 'text-cyan-400'} size={24} />
          <h1 onClick={handleEggTrigger} className="font-black italic text-xl tracking-tighter cursor-pointer select-none">{ui.SYSTEM}</h1>
        </div>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 border rounded-full border-gray-500"><Zap size={18}/></button>
      </nav>

      <div className="p-4 max-w-7xl mx-auto">
        {activeTab === "ARSENAL" ? (
          <>
            {/* 2. 篩選與排序面板 (全齊) ✅ */}
            <div className="space-y-4 mb-8">
              <input type="text" placeholder={ui.QUERY} className={`w-full border-b-2 p-5 text-xl outline-none font-black ${
                theme==='light' ? 'bg-white border-black text-black' : 'bg-transparent border-cyan-900 text-white'
              }`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex bg-black/5 p-1 rounded-xl border border-black/10">
                  {['all', 'BX', 'UX', 'CX'].map(s => (
                    <button key={s} onClick={() => setCurrentSeries(s)} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                      currentSeries === s ? (theme==='light' ? 'bg-black text-white' : 'bg-cyan-600 text-white shadow-glow') : 'opacity-40'
                    }`}>{s.toUpperCase()}</button>
                  ))}
                </div>
                <select onChange={(e) => setCurrentGet(e.target.value)} value={currentGet} className={`text-xs p-2 rounded-xl font-black border ${theme==='light'?'bg-white border-black':'bg-black border-cyan-900 text-cyan-400'}`}>
                  <option value="all">GET_ALL</option><option value="通販">📦通販</option><option value="A">📱APP</option><option value="J">🇯🇵日本</option><option value="box">🎲抽包</option>
                </select>
                <button onClick={() => setShowFavOnly(!showFavOnly)} className={`p-2 border rounded-xl transition-all ${showFavOnly ? 'bg-yellow-500 border-yellow-500 text-black shadow-glow' : theme==='light' ? 'border-black text-black' : 'border-cyan-900 text-cyan-900'}`}>
                  <Star size={16} fill={showFavOnly?"black":"none"}/>
                </button>
                <span className="text-xs font-black opacity-60 italic">{processedProducts.length} {ui.ITEMS_FOUND}</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[{ k: 'model', i: ui.SORT_MODEL, s: '📇' }, { k: 'ratchet', i: 'RAT', s: '⚙️' }, { k: 'bit_code', i: 'BIT', s: '🔰' }, { k: 'price', i: ui.SORT_PRC, s: '💰' }].map(item => (
                  <button key={item.k} onClick={() => { if(sortKey===item.k) setSortOrder(sortOrder==='asc'?'desc':'asc'); else {setSortKey(item.k); setSortOrder('asc');} }}
                    className={`flex flex-col items-center py-2 rounded-xl border transition-all font-black ${
                      sortKey === item.k ? 'border-cyan-400 bg-cyan-900/20 text-cyan-400 shadow-glow' : theme==='light' ? 'bg-white border-gray-300 text-gray-500' : 'border-cyan-900/30 text-cyan-700 opacity-60'
                    }`}>
                    <span className="text-xl">{item.s}</span>
                    <span className="text-[9px] uppercase mt-1 tracking-widest">{item.i} {sortKey === item.k ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 產品卡片 (四語名回歸) ✅ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {processedProducts.map((p) => (
                <div key={p.model} onClick={() => setSelectedProduct(p)}
                     className={`group relative p-6 border-2 transition-all cursor-pointer overflow-hidden min-h-[300px] flex flex-col justify-between ${
                       theme==='light' ? 'bg-white border-black text-black hover:shadow-2xl' : 'bg-[#0a0a0a] border-cyan-900/50 hover:border-cyan-400 hover:shadow-glow'
                     }`}>
                  <div className={`absolute -right-2 -bottom-2 font-black italic opacity-[0.03] ${p.model.length > 8 ? 'text-4xl' : 'text-6xl'}`}>{p.model}</div>
                  <div className="relative z-10 flex justify-between font-mono font-black text-sm"><span>{p.model}</span><span className="italic">¥{p.price||'---'}</span></div>
                  <div className="relative z-10 space-y-1">
                    <h3 className="text-xl font-black uppercase leading-tight">{getDisplayName(p, lang)}</h3>
                    {/* 卡片預覽四語 ✅ */}
                    <div className="grid grid-cols-1 text-[10px] font-black opacity-60 italic">
                      <div className="truncate">HK: {getDisplayName(p, 'zh_hk')}</div>
                      <div className="truncate">TW: {getDisplayName(p, 'zh_tw')}</div>
                      <div className="truncate">EN: {getDisplayName(p, 'en')}</div>
                      <div className="truncate">JP: {getDisplayName(p, 'jp')}</div>
                    </div>
                  </div>
                  <div className={`relative z-10 flex justify-between items-center pt-3 border-t-2 ${theme==='light'?'border-black':'border-cyan-900/30'}`}>
                    <span className="text-[9px] font-black uppercase tracking-tighter italic">⚙️ {p.ratchet} // 🔰 {p.bit_code}</span>
                  </div>
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${p.type==='UX'?'bg-red-600':p.type==='CX'?'bg-green-600':'bg-cyan-600'}`}></div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* 4. 零件匹配 (INTEL) 全齊 ✅ */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
            <div className="lg:col-span-5 space-y-6">
              <div className={`p-6 border-2 ${theme==='light'?'bg-gray-50 border-black':'bg-black border-cyan-900/50'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-black text-lg text-cyan-500 flex items-center gap-2"><ListChecks size={20}/> {ui.INTEL}</h4>
                  <button onClick={() => setWishlist({ratchet:[], bit:[], assist:[]})} className="text-[10px] font-black text-red-500 border border-red-500 px-2 py-1 rounded">RESET</button>
                </div>
                <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                  {[{id:'ratchet', label:ui.R_POOL, data:pool.ratchets}, {id:'bit', label:ui.B_POOL, data:pool.bits}, {id:'assist', label:ui.A_POOL, data:pool.assists}].map(sec => (
                    <div key={sec.id}>
                      <p className="text-[10px] font-black opacity-40 mb-2 uppercase">{sec.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {sec.data.map((val: any) => (
                          <button key={val} onClick={() => setWishlist((v: any) => ({...v, [sec.id]: v[sec.id].includes(val) ? v[sec.id].filter((x: any)=>x!==val) : [...v[sec.id], val]}))}
                            className={`text-xs px-3 py-1.5 border-2 font-black transition-all ${wishlist[sec.id].includes(val) ? 'bg-cyan-600 border-cyan-400 text-white shadow-glow' : 'border-gray-800 text-gray-500'}`}>{val}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-4">
              <h4 className="font-black text-lg text-cyan-400 border-b-2 border-cyan-900/50 pb-2">{ui.OPTIMAL} ({recommendations.length})</h4>
              <div className="grid grid-cols-1 gap-3">
                {recommendations.map(p => (
                  <div key={p.model} onClick={() => setSelectedProduct(p)} className={`p-4 border-2 flex justify-between items-center cursor-pointer transition-all ${theme==='light'?'bg-white border-black':'bg-cyan-950/10 border-cyan-900/50 hover:border-cyan-400'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`text-xl font-black italic ${p.score >= 2 ? 'text-cyan-400 shadow-glow' : 'text-gray-600'}`}>{p.score}</div>
                      <div>
                        <div className="text-[10px] font-mono opacity-50">{p.model}</div>
                        <div className="text-md font-black uppercase">{getDisplayName(p, lang)}</div>
                      </div>
                    </div>
                    <div className="text-xl font-black text-cyan-500">¥{p.price||'---'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. 詳細彈窗 (STATUS + CX拆解) ✅ */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-lg border-4 p-8 relative shadow-2xl ${theme==='light' ? 'bg-white border-black text-black' : 'bg-black border-cyan-500 text-white shadow-glow'}`}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-cyan-500 hover:text-white transition-colors"><X size={32}/></button>
            <div className="mb-6 border-b-4 border-cyan-900 pb-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-cyan-600 font-mono text-sm font-black tracking-widest uppercase italic tracking-tighter">STATUS: ACTIVE_UNIT // {selectedProduct.data_get}</span>
                <span className="text-xl font-mono font-black">{selectedProduct.model}</span>
              </div>
              <h2 className="text-4xl font-black italic uppercase leading-none">{getDisplayName(selectedProduct, lang)}</h2>
            </div>
            <div className="space-y-6">
               <div className={`p-4 border-2 grid grid-cols-3 gap-2 text-center ${theme==='light'?'bg-gray-100 border-black':'bg-cyan-900/10 border-cyan-900/50'}`}>
                  <div><p className="text-[8px] opacity-40 font-black">CHIP 晶片</p><p className="text-sm font-black">{getC(selectedProduct, 'chip', lang) || "-"}</p></div>
                  <div className="border-x border-cyan-900/30"><p className="text-[8px] opacity-40 font-black">MAIN 主刃</p><p className="text-sm font-black">{getC(selectedProduct, 'main_blade', lang) || "-"}</p></div>
                  <div><p className="text-[8px] opacity-40 font-black">ASSIST({selectedProduct.assist_blade_code})</p><p className="text-sm font-black">{getC(selectedProduct, 'assist_blade', lang) || "-"}</p></div>
               </div>
               <div className={`p-4 border-2 grid grid-cols-1 gap-1 text-[11px] font-black ${theme==='light'?'bg-gray-100 border-black':'bg-cyan-950/30 border-cyan-900/50'}`}>
                  {['zh_hk', 'zh_tw', 'en', 'jp'].map(l => (
                    <div key={l} className="flex justify-between border-b border-black/5 last:border-none pb-1 uppercase">
                      <span className="opacity-40">{l.split('_')[1] || l}:</span><span>{getDisplayName(selectedProduct, l)}</span>
                    </div>
                  ))}
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className={`p-6 border-2 text-center ${theme==='light'?'bg-gray-100 border-black':'bg-cyan-900/10 border-cyan-900/50'}`}>
                    <p className="text-[10px] mb-2 uppercase font-black text-cyan-700">RATCHET 齒輪</p>
                    <p className="text-3xl font-black">{selectedProduct.ratchet}</p>
                  </div>
                  <div className={`p-6 border-2 text-center ${theme==='light'?'bg-gray-100 border-black':'bg-cyan-900/10 border-cyan-900/50'}`}>
                    <p className="text-[10px] mb-2 uppercase font-black text-cyan-700">BIT 軸心</p>
                    <p className="text-3xl font-black">{selectedProduct.bit_code}</p>
                    <p className="text-[10px] mt-1 italic opacity-60">({selectedProduct[`bit_name_${lang}`] || selectedProduct.bit_name_en})</p>
                  </div>
               </div>
               <div className={`p-6 border-4 flex justify-between items-center ${theme==='light'?'bg-black text-white shadow-lg':'border-cyan-500/30 bg-cyan-500/5 shadow-glow'}`}>
                  <span className="text-sm font-black uppercase tracking-widest">{ui.PRICE_LABEL}</span>
                  <span className="text-5xl font-black italic">¥{selectedProduct.price||'---'}</span>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* 底部導航 */}
      <div className={`fixed bottom-0 left-0 right-0 border-t-4 flex justify-around p-3 z-[100] backdrop-blur-xl ${
        theme === 'light' ? 'bg-white border-black' : 'bg-black/95 border-cyan-900/50 shadow-glow'
      }`}>
        <button onClick={() => setActiveTab("ARSENAL")} className={`flex flex-col items-center p-2 transition-all ${activeTab === "ARSENAL" ? (theme==='light'?'text-black scale-110':'text-cyan-400 shadow-glow scale-110') : 'text-gray-500 opacity-40'}`}>
          <Shield size={32}/><span className="text-[10px] font-black uppercase">{ui.ARSENAL}</span>
        </button>
        <button onClick={() => setActiveTab("INTEL")} className={`flex flex-col items-center p-2 transition-all ${activeTab === "INTEL" ? (theme==='light'?'text-black scale-110':'text-cyan-400 shadow-glow scale-110') : 'text-gray-500 opacity-40'}`}>
          <TrendingUp size={32}/><span className="text-[10px] font-black uppercase">{ui.INTEL}</span>
        </button>
      </div>

      <style>{`
        .shadow-glow { filter: drop-shadow(0 0 10px rgba(0, 242, 255, 0.6)); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}